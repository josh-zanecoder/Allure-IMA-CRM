import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import connectToMongoDB from "@/lib/mongoose";
import Reminder from "@/models/Reminder";
import Prospect from "@/models/Prospect";

// GET /api/reminders - fetch all reminders
export async function GET(request: NextRequest) {
  try {
    await connectToMongoDB();

    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user");

    // Parse user data from cookie
    if (!userCookie || !userCookie.value) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const userData = JSON.parse(userCookie.value);

    // Fetch all active reminders
    const remindersData = await Reminder.find({
      isActive: true,
    }).lean();

    // Convert reminders to a format safe for JSON response
    const formattedReminders = remindersData.map((reminder: any) => ({
      _id: reminder._id ? reminder._id.toString() : "",
      title: reminder.title || "",
      description: reminder.description || "",
      type: reminder.type || "",
      status: reminder.status || "PENDING",
      dueDate: reminder.dueDate
        ? new Date(reminder.dueDate).toISOString()
        : new Date().toISOString(),
      completedAt: reminder.completedAt
        ? new Date(reminder.completedAt).toISOString()
        : null,
      isActive: !!reminder.isActive,
      createdAt: reminder.createdAt
        ? new Date(reminder.createdAt).toISOString()
        : new Date().toISOString(),
      updatedAt: reminder.updatedAt
        ? new Date(reminder.updatedAt).toISOString()
        : new Date().toISOString(),
      addedBy: reminder.addedBy ? reminder.addedBy.toString() : "",
      prospectId: reminder.prospectId ? reminder.prospectId.toString() : "",
    }));

    return NextResponse.json(formattedReminders);
  } catch (error) {
    console.error("Error fetching reminders:", error);
    return NextResponse.json(
      { error: "Failed to fetch reminders" },
      { status: 500 }
    );
  }
}
