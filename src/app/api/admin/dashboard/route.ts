import { NextResponse } from "next/server";
import { activityService } from "@/lib/activity";

export async function GET(request: Request) {
  console.log(`[${new Date().toISOString()}] Fetching activities...`);

  try {
    const activities = await activityService.getAll();

    if (!activities) {
      console.log("No activities found");
      return NextResponse.json(
        { message: "No activities found" },
        { status: 404 }
      );
    }

    console.log(
      `[${new Date().toISOString()}] Sending response:`,
      activities.length,
      "activities"
    );

    return NextResponse.json(
      {
        success: true,
        count: activities.length,
        data: activities,
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to fetch activities:", errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
