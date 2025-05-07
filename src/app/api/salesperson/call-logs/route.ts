import { NextResponse } from "next/server";
import connectToMongoDB from "@/lib/mongoose";
import { CallLog } from "@/models/CallLogs";

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    console.log("Call log request body:", body);

    const { to, from, userId, prospectId, callSid, activityId, transcription } =
      body;

    // Validate required fields
    if (!to || !from || !userId || !prospectId || !callSid || !activityId) {
      console.error("Missing required fields:", {
        to,
        from,
        userId,
        prospectId,
        callSid,
        activityId,
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await connectToMongoDB();
    console.log("MongoDB connected successfully");

    // Prepare call log data
    const callLogData = {
      to,
      from,
      userId,
      prospectId,
      callSid,
      activityId,
      transcription: "Pending transcription", // Provide a default non-empty value
      memberId: body.memberId || "", // Optional field
      parentCallSid: body.parentCallSid || "", // Optional field
    };

    console.log("Creating call log with data:", callLogData);

    // Create new call log
    const callLog = await CallLog.create(callLogData);
    console.log("Call log created successfully:", callLog);

    return NextResponse.json(callLog, { status: 201 });
  } catch (error: any) {
    console.error("Error creating call log:", error);

    // More detailed error logging
    if (error.name === "ValidationError") {
      console.error("Validation error details:", error.errors);
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create call log",
        message: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
