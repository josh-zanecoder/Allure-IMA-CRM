import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import connectToMongoDB from "@/lib/mongoose";
import Prospect from "@/models/Prospect";
import Reminder from "@/models/Reminder";
import Activity from "@/models/Activity";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

// Define interfaces for the processed data
interface ProcessedProspect {
  _id: string;
  firstName?: string;
  lastName?: string;
}

interface ProcessedActivity {
  _id: string;
  title: string;
  createdAt: string;
  type: string;
  dueDate: string | null;
  prospectId: ProcessedProspect | string;
}

interface ProcessedReminder {
  _id: string;
  title: string;
  dueDate: string;
  type: string;
  prospectId: ProcessedProspect | string;
}

// Define interface for Prospect document
interface ProspectDocument {
  _id: mongoose.Types.ObjectId;
  firstName?: string;
  lastName?: string;
  [key: string]: any;
}

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

    // Run remaining queries in parallel with error handling for each
    try {
      // First, get data that doesn't require population
      const [pendingReminders, lastMonthProspects, previousWeekReminders] =
        await Promise.all([
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
        ]);

      // Get upcoming reminders without population first
      const upcomingRemindersRaw = await Reminder.find({
        prospectId: { $in: prospectIds },
        dueDate: { $gte: new Date() },
        status: "PENDING",
        isActive: true,
      })
        .select("_id title dueDate type prospectId")
        .sort({ dueDate: 1 })
        .limit(5)
        .lean();

      // Process the reminders data without relying on population
      const upcomingReminders: ProcessedReminder[] = await Promise.all(
        upcomingRemindersRaw.map(async (reminder) => {
          const r = reminder as any;
          let prospectData: ProcessedProspect | string = "Unknown";

          // If prospectId exists, try to fetch the prospect data directly
          if (r.prospectId && ObjectId.isValid(r.prospectId)) {
            try {
              const prospect = (await Prospect.findById(r.prospectId)
                .select("firstName lastName")
                .lean()) as ProspectDocument;

              if (prospect) {
                prospectData = {
                  _id: r.prospectId.toString(),
                  firstName: prospect.firstName || "",
                  lastName: prospect.lastName || "",
                };
              }
            } catch (error) {
              console.error("Error fetching prospect for reminder:", error);
            }
          }

          return {
            _id: r._id.toString(),
            title: r.title,
            dueDate: r.dueDate?.toISOString() || new Date().toISOString(),
            type: r.type,
            prospectId: prospectData,
          };
        })
      );

      // Get recent activities separately with error handling
      let recentActivities: ProcessedActivity[] = [];
      try {
        // Get activities without population first
        const recentActivitiesRaw = await Activity.find({
          prospectId: { $in: prospectIds },
          isActive: true,
        })
          .select("_id title createdAt type prospectId dueDate")
          .sort({ createdAt: -1 })
          .limit(5)
          .lean();

        // Process the activities data without relying on population
        recentActivities = await Promise.all(
          recentActivitiesRaw.map(async (activity) => {
            const a = activity as any;
            let prospectData: ProcessedProspect | string = "Unknown";

            // If prospectId exists, try to fetch the prospect data directly
            if (a.prospectId && ObjectId.isValid(a.prospectId)) {
              try {
                const prospect = (await Prospect.findById(a.prospectId)
                  .select("firstName lastName")
                  .lean()) as ProspectDocument;

                if (prospect) {
                  prospectData = {
                    _id: a.prospectId.toString(),
                    firstName: prospect.firstName || "",
                    lastName: prospect.lastName || "",
                  };
                }
              } catch (error) {
                console.error("Error fetching prospect for activity:", error);
              }
            }

            return {
              _id: a._id.toString(),
              title: a.title,
              createdAt: a.createdAt?.toISOString() || new Date().toISOString(),
              type: a.type,
              dueDate: a.dueDate?.toISOString() || null,
              prospectId: prospectData,
            };
          })
        );
      } catch (activityError) {
        console.error("Error fetching activities:", activityError);
        // Continue with empty activities rather than failing the entire request
      }

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
          // Trend data for enrollment leads
          enrollmentLeads: {
            count: currentMonthProspects,
            percent: prospectGrowthPercent,
            trend: Number(prospectGrowthPercent) >= 0 ? "up" : "down",
            comparison: "month",
          },
          // Trend data for application rate (reminders)
          applicationRate: {
            count: currentWeekReminders,
            percent: reminderChangePercent,
            trend: Number(reminderChangePercent) >= 0 ? "up" : "down",
            comparison: "week",
          },
          // Program interest placeholder (since we don't have the data)
          programInterest: {
            topProgram: "General Program",
            count: 0,
            percentChange: "0.0",
            trend: "up",
          },
          // Campus distribution placeholder
          campusDistribution: {
            topCampus: "Main Campus",
            percent: "0.0",
          },
          // Lists for display
          upcomingReminders,
          recentActivities,
        },
      });
    } catch (queryError) {
      console.error("Error in dashboard queries:", queryError);
      return NextResponse.json(
        {
          error: "Failed to fetch dashboard data",
          details:
            queryError instanceof Error
              ? queryError.message
              : String(queryError),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Dashboard Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch dashboard data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
