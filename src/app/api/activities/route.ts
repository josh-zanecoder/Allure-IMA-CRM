import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import connectToMongoDB from "@/lib/mongoose";
import Activity from "@/models/Activity";
import Prospect from "@/models/Prospect";
import { ActivitySchema } from "@/lib/validation/activity-schema";
import { z } from "zod";

// GET /api/activities
export async function GET(request: NextRequest) {
  try {
    await connectToMongoDB();

    // Get user from cookie
    const userCookie = request.cookies.get("user")?.value;

    if (!userCookie) {
      return NextResponse.json(
        { error: "Unauthorized: No user found" },
        { status: 401 }
      );
    }

    const userData = JSON.parse(userCookie);

    if (!ObjectId.isValid(userData.id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Get all prospects assigned to this user
    const userProspects = await Prospect.find(
      { "assignedTo._id": userData.id },
      { _id: 1 }
    ).lean();

    // Extract IDs for activities query
    const prospectIds = userProspects.map((p) => p._id);

    // Get activities for user's prospects
    const activities = await Activity.find({
      prospectId: { $in: prospectIds },
      isActive: true,
    })
      .populate("prospectId", "firstName lastName email phone")
      .sort({ dueDate: 1 })
      .lean();

    // Format and validate the data for the frontend
    const formattedActivities = activities.map((activity) => {
      const activityObj = activity as any; // Cast to any to avoid TypeScript errors with lean() result

      // Handle prospect reference safely (avoiding error if it's null)
      let prospectRef;
      if (
        activityObj.prospectId &&
        typeof activityObj.prospectId === "object"
      ) {
        prospectRef = {
          _id: activityObj.prospectId._id?.toString() || "",
          firstName: activityObj.prospectId.firstName || "",
          lastName: activityObj.prospectId.lastName || "",
          email: activityObj.prospectId.email || "",
          phone: activityObj.prospectId.phone || "",
        };
      } else {
        prospectRef = activityObj.prospectId?.toString() || "";
      }

      // Normalize status and type to uppercase for enum validation
      let type = activityObj.type || "OTHER";
      let status = activityObj.status || "PENDING";

      // Convert to uppercase if it's a string (handle both "Task" and "TASK" formats)
      if (typeof type === "string") {
        type = type.toUpperCase().replace(/\s/g, "_");
      }

      if (typeof status === "string") {
        status = status.toUpperCase().replace(/\s/g, "_");
        // Map "IN_PROGRESS" to "PENDING" if needed
        if (status === "IN_PROGRESS") {
          status = "PENDING";
        }
      }

      return {
        _id: activityObj._id.toString(),
        title: activityObj.title || "",
        description: activityObj.description || "",
        type: type,
        status: status,
        dueDate: activityObj.dueDate?.toISOString() || null,
        completedDate: activityObj.completedAt?.toISOString() || null,
        prospectId: prospectRef,
        addedBy: activityObj.addedBy?.toString() || "",
        isActive: !!activityObj.isActive,
        createdAt:
          activityObj.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt:
          activityObj.updatedAt?.toISOString() || new Date().toISOString(),
      };
    });

    // Validate the response data with Zod
    const validationResult = z
      .array(ActivitySchema)
      .safeParse(formattedActivities);

    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error);
      // Return the data anyway, but log the validation errors
      return NextResponse.json(formattedActivities);
    }

    // Return either the validated data or the original formatted data if there's an issue
    try {
      return NextResponse.json(validationResult.data);
    } catch (err) {
      console.error("Error serializing response:", err);
      return NextResponse.json(formattedActivities);
    }
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
