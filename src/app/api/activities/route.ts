import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import connectToMongoDB from "@/lib/mongoose";
import Activity from "@/models/Activity";

// GET /api/activities
export async function GET(request: NextRequest) {
  try {
    await connectToMongoDB();

    // Get activities for all prospects, sorted by due date
    const activities = await Activity.find({
      isActive: true,
    })
      .populate("prospectId", "firstName lastName email phone")
      .sort({ dueDate: 1 })
      .limit(50) // Limit to 50 most recent activities
      .lean();

    // Format the data for the frontend
    const formattedActivities = activities.map((activity) => {
      const activityObj = activity as any; // Cast to any to avoid TypeScript errors with lean() result
      return {
        ...activityObj,
        _id: activityObj._id.toString(),
        prospectId:
          typeof activityObj.prospectId === "object"
            ? {
                _id: activityObj.prospectId._id.toString(),
                firstName: activityObj.prospectId.firstName,
                lastName: activityObj.prospectId.lastName,
                email: activityObj.prospectId.email,
                phone: activityObj.prospectId.phone,
              }
            : activityObj.prospectId?.toString(),
        addedBy: activityObj.addedBy?.toString(),
        dueDate: activityObj.dueDate?.toISOString(),
        completedDate: activityObj.completedAt?.toISOString(),
        createdAt: activityObj.createdAt?.toISOString(),
        updatedAt: activityObj.updatedAt?.toISOString(),
      };
    });

    return NextResponse.json(formattedActivities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
