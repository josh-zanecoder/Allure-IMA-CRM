import { NextResponse } from "next/server";
import { activityService } from "@/lib/activity";
import "@/models/User";
import "@/models/Prospect";

export async function GET(request: Request) {
  console.log(`[${new Date().toISOString()}] Fetching activities...`);

  try {
    // Attempt to get real data from database
    const activities = await activityService.getAll();

    if (!activities) {
      console.log("No activities found, returning empty array");
      return NextResponse.json(
        {
          success: true,
          count: 0,
          data: [],
        },
        { status: 200 }
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
    console.error("Failed to fetch activities from database:", errorMessage);

    // Detailed error logging
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error stack:", error.stack);

      // Special handling for missing schema errors
      if (
        error.name === "MissingSchemaError" ||
        errorMessage.includes("Schema hasn't been registered")
      ) {
        console.error(
          "This is a schema registration error. Ensure all models are properly imported in the correct order."
        );
      }
    }

    // Return empty data instead of mock data or error
    return NextResponse.json(
      {
        success: true,
        count: 0,
        data: [],
        error: errorMessage, // Include error message for debugging but don't affect success flag
      },
      { status: 200 }
    );
  }
}
