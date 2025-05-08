import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import connectToMongoDB from "@/lib/mongoose";
import Reminder from "@/models/Reminder";
import Prospect from "@/models/Prospect";
import { ReminderSchema } from "@/lib/validation/reminder-schema";
import { z } from "zod";

// GET /api/reminders
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

    // Extract IDs for reminders query
    const prospectIds = userProspects.map((p) => p._id);

    // Get reminders for user's prospects, sorted by due date with pending ones first
    const reminders = await Reminder.find({
      prospectId: { $in: prospectIds },
      isActive: true,
    })
      .populate("prospectId", "firstName lastName email phone")
      .sort({ status: 1, dueDate: 1 }) // Sort by status, then due date
      .lean();

    // Format and validate the data for the frontend
    const formattedReminders = reminders.map((reminder) => {
      const reminderObj = reminder as any; // Cast to any to avoid TypeScript errors with lean() result

      // Handle prospect reference safely (avoiding error if it's null)
      let prospectRef;
      if (
        reminderObj.prospectId &&
        typeof reminderObj.prospectId === "object"
      ) {
        prospectRef = {
          _id: reminderObj.prospectId._id?.toString() || "",
          firstName: reminderObj.prospectId.firstName || "",
          lastName: reminderObj.prospectId.lastName || "",
          email: reminderObj.prospectId.email || "",
          phone: reminderObj.prospectId.phone || "",
        };
      } else {
        prospectRef = reminderObj.prospectId?.toString() || "";
      }

      // Normalize status and type to uppercase for enum validation
      let type = reminderObj.type || "OTHER";
      let status = reminderObj.status || "PENDING";

      // Convert to uppercase if it's a string (handle both "Task" and "TASK" formats)
      if (typeof type === "string") {
        type = type.toUpperCase().replace(/\s/g, "_");
        // Map database values to schema values if needed
        if (type === "TASK") {
          type = "OTHER";
        }
      }

      if (typeof status === "string") {
        status = status.toUpperCase().replace(/\s/g, "_");
        // Map "IN_PROGRESS" to "PENDING" if needed
        if (status === "IN_PROGRESS") {
          status = "PENDING";
        }
      }

      return {
        _id: reminderObj._id.toString(),
        title: reminderObj.title || "",
        description: reminderObj.description || "",
        type: type,
        status: status,
        dueDate: reminderObj.dueDate?.toISOString() || new Date().toISOString(),
        completedAt: reminderObj.completedAt?.toISOString() || null,
        prospectId: prospectRef,
        addedBy: reminderObj.addedBy?.toString() || "",
        isActive: !!reminderObj.isActive,
        createdAt:
          reminderObj.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt:
          reminderObj.updatedAt?.toISOString() || new Date().toISOString(),
      };
    });

    // Validate the response data with Zod
    const validationResult = z
      .array(ReminderSchema)
      .safeParse(formattedReminders);

    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error);
      // Return the data anyway, but log the validation errors
      return NextResponse.json(formattedReminders);
    }

    // Return either the validated data or the original formatted data if there's an issue
    try {
      return NextResponse.json(validationResult.data);
    } catch (err) {
      console.error("Error serializing response:", err);
      return NextResponse.json(formattedReminders);
    }
  } catch (error) {
    console.error("Error fetching reminders:", error);
    return NextResponse.json(
      { error: "Failed to fetch reminders" },
      { status: 500 }
    );
  }
}
