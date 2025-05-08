import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import connectToMongoDB from "@/lib/mongoose";
import Reminder from "@/models/Reminder";

// GET /api/reminders
export async function GET(request: NextRequest) {
  try {
    await connectToMongoDB();

    // Get reminders for all prospects, sorted by due date with pending ones first
    const reminders = await Reminder.find({
      isActive: true,
    })
      .populate("prospectId", "firstName lastName email phone")
      .sort({ status: 1, dueDate: 1 }) // Sort by status, then due date
      .limit(50) // Limit to 50 most relevant reminders
      .lean();

    // Format the data for the frontend
    const formattedReminders = reminders.map((reminder) => {
      const reminderObj = reminder as any; // Cast to any to avoid TypeScript errors with lean() result
      return {
        ...reminderObj,
        _id: reminderObj._id.toString(),
        prospectId:
          typeof reminderObj.prospectId === "object"
            ? {
                _id: reminderObj.prospectId._id.toString(),
                firstName: reminderObj.prospectId.firstName,
                lastName: reminderObj.prospectId.lastName,
                email: reminderObj.prospectId.email,
                phone: reminderObj.prospectId.phone,
              }
            : reminderObj.prospectId?.toString(),
        addedBy: reminderObj.addedBy?.toString(),
        dueDate: reminderObj.dueDate?.toISOString(),
        completedAt: reminderObj.completedAt?.toISOString(),
        createdAt: reminderObj.createdAt?.toISOString(),
        updatedAt: reminderObj.updatedAt?.toISOString(),
      };
    });

    return NextResponse.json(formattedReminders);
  } catch (error) {
    console.error("Error fetching reminders:", error);
    return NextResponse.json(
      { error: "Failed to fetch reminders" },
      { status: 500 }
    );
  }
}
