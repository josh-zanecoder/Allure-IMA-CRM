import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import connectToMongoDB from "@/lib/mongoose";
import Prospect from "@/models/Prospect";
import Reminder from "@/models/Reminder";
import Activity from "@/models/Activity";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const userCookie = request.cookies.get("user")?.value;

    if (!userCookie) {
      return NextResponse.json(
        { error: "No user cookie found" },
        { status: 401 }
      );
    }

    const userData = JSON.parse(userCookie || "");

    if (!ObjectId.isValid(userData.id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Connect to MongoDB via Mongoose
    await connectToMongoDB();

    // Get current date and date ranges for comparison
    const currentDate = new Date();

    // For monthly comparison (prospects)
    const lastMonthStart = new Date(currentDate);
    lastMonthStart.setMonth(currentDate.getMonth() - 1);
    lastMonthStart.setDate(1);
    lastMonthStart.setHours(0, 0, 0, 0);

    const currentMonthStart = new Date(currentDate);
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);

    // For weekly comparison (tasks)
    const oneWeekAgo = new Date(currentDate);
    oneWeekAgo.setDate(currentDate.getDate() - 7);

    const twoWeeksAgo = new Date(currentDate);
    twoWeeksAgo.setDate(currentDate.getDate() - 14);

    // First query: Get all prospects assigned to this user
    const currentProspects = await Prospect.find(
      { "assignedTo._id": userData.id },
      { _id: 1, createdAt: 1 }
    ).lean();

    // Extract IDs for subsequent queries
    const prospectIds = currentProspects.map((p) => p._id);

    // Run remaining queries in parallel
    const [
      pendingReminders,
      lastMonthProspects,
      previousWeekReminders,
      upcomingRemindersRaw,
      recentActivitiesRaw,
    ] = await Promise.all([
      // Current pending reminders
      Reminder.countDocuments({
        prospectId: { $in: prospectIds },
        status: "PENDING",
        isActive: true,
      }),

      // Last month prospects count
      Prospect.countDocuments({
        "assignedTo._id": userData.id,
        createdAt: { $gte: lastMonthStart, $lt: currentMonthStart },
      }),

      // Previous week pending reminders
      Reminder.countDocuments({
        prospectId: { $in: prospectIds },
        status: "PENDING",
        isActive: true,
        createdAt: { $gte: twoWeeksAgo, $lt: oneWeekAgo },
      }),

      // Upcoming reminders list with prospect data
      Reminder.find({
        prospectId: { $in: prospectIds },
        dueDate: { $gte: new Date() },
        status: "PENDING",
        isActive: true,
      })
        .populate("prospectId", "firstName lastName")
        .select("_id title dueDate type prospectId")
        .sort({ dueDate: 1 })
        .limit(5)
        .lean(),

      // Recent activities list with prospect data
      Activity.find({
        prospectId: { $in: prospectIds },
        isActive: true,
      })
        .populate("prospectId", "firstName lastName")
        .select("_id title createdAt type prospectId dueDate")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    // Process the populated data to ensure it's serializable
    const upcomingReminders = upcomingRemindersRaw.map((reminder) => {
      const r = reminder as any; // Cast to any to handle lean() result
      return {
        _id: r._id.toString(),
        title: r.title,
        dueDate: r.dueDate?.toISOString() || new Date().toISOString(),
        type: r.type,
        prospectId: r.prospectId
          ? {
              _id: r.prospectId._id?.toString() || "",
              firstName: r.prospectId.firstName || "",
              lastName: r.prospectId.lastName || "",
            }
          : "Unknown",
      };
    });

    // Process the populated activities data
    const recentActivities = recentActivitiesRaw.map((activity) => {
      const a = activity as any; // Cast to any to handle lean() result
      return {
        _id: a._id.toString(),
        title: a.title,
        createdAt: a.createdAt?.toISOString() || new Date().toISOString(),
        type: a.type,
        dueDate: a.dueDate?.toISOString() || null,
        prospectId: a.prospectId
          ? {
              _id: a.prospectId._id?.toString() || "",
              firstName: a.prospectId.firstName || "",
              lastName: a.prospectId.lastName || "",
            }
          : "Unknown",
      };
    });

    // Calculate current month prospects
    const currentMonthProspects = currentProspects.filter((p) => {
      // Handle the type conversion safely
      const createdDate =
        p.createdAt instanceof Date
          ? p.createdAt
          : new Date(p.createdAt as string);
      return createdDate >= currentMonthStart;
    }).length;

    // Calculate percent changes
    const prospectGrowthPercent =
      lastMonthProspects > 0
        ? (
            ((currentMonthProspects - lastMonthProspects) /
              lastMonthProspects) *
            100
          ).toFixed(1)
        : "0.0";

    const currentWeekReminders = pendingReminders;
    const reminderChangePercent =
      previousWeekReminders > 0
        ? (
            ((currentWeekReminders - previousWeekReminders) /
              previousWeekReminders) *
            100
          ).toFixed(1)
        : "0.0";

    return NextResponse.json({
      stats: {
        totalProspects: currentProspects.length,
        pendingReminders,
        // Trend data
        prospectGrowth: {
          percent: prospectGrowthPercent,
          trend: Number(prospectGrowthPercent) >= 0 ? "up" : "down",
          comparison: "month",
        },
        reminderChange: {
          percent: reminderChangePercent,
          trend: Number(reminderChangePercent) >= 0 ? "up" : "down",
          comparison: "week",
        },
        // Lists for display
        upcomingReminders,
        recentActivities,
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
