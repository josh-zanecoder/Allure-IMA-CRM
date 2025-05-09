import { NextRequest, NextResponse } from "next/server";
import connectToMongoDB from "@/lib/mongoose";
import mongoose from "mongoose";
export const dynamic = "force-dynamic";

// Define the CallLog model schema
const CallLogSchema = new mongoose.Schema(
  {
    to: String,
    from: String,
    userId: String,
    prospectId: String,
    callSid: String,
    memberId: String,
    parentCallSid: String,
    activityId: String,
    transcription: String,
  },
  { timestamps: true }
);

// Create or retrieve the CallLog model
const CallLog =
  mongoose.models.CallLog || mongoose.model("CallLog", CallLogSchema);

interface CallLogDocument {
  _id: mongoose.Types.ObjectId;
  to: string;
  from: string;
  userId: string;
  prospectId: string;
  callSid: string;
  memberId: string;
  parentCallSid: string;
  activityId: string;
  transcription: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(request: NextRequest) {
  try {
    console.log("API: Connecting to MongoDB...");
    await connectToMongoDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const skip = (page - 1) * limit;

    console.log(`API: Fetching call logs for page ${page}, limit ${limit}`);

    // For testing purposes, let's create some sample data if none exists
    const count = await CallLog.countDocuments();

    if (count === 0) {
      console.log("API: No call logs found, creating sample data");
      // Create sample call logs for testing
      const sampleLogs = [
        {
          to: "+11231231231",
          from: "+11212312312",
          userId: "sample-user-id",
          prospectId: "sample-prospect-id",
          callSid: "sample-call-sid-1",
          transcription: "This is a sample transcription for testing purposes.",
        },
        {
          to: "+11231231232",
          from: "+11212312313",
          userId: "sample-user-id",
          prospectId: "sample-prospect-id-2",
          callSid: "sample-call-sid-2",
          transcription: "Another sample transcription for testing.",
        },
        {
          to: "+11231231233",
          from: "+11212312314",
          userId: "sample-user-id",
          prospectId: "sample-prospect-id-3",
          callSid: "sample-call-sid-3",
          transcription: "Third sample transcription.",
        },
      ];

      await CallLog.insertMany(sampleLogs);
      console.log("API: Sample data created");
    }

    // For testing, let's skip authentication
    // const userCookie = request.cookies.get("user")?.value;
    // const tokenCookie = request.cookies.get("token")?.value;
    //
    // if (!userCookie || !tokenCookie) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }
    //
    // const userData = JSON.parse(userCookie);
    //
    // // Base query to filter by user ID
    // const baseQuery = { userId: userData.id };

    // For testing, don't filter by user ID
    const baseQuery = {};

    const totalCount = await CallLog.countDocuments(baseQuery);
    console.log(`API: Found ${totalCount} total call logs`);

    const callLogsList = await CallLog.find(baseQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    console.log(
      `API: Retrieved ${callLogsList.length} call logs for current page`
    );

    const formattedCallLogs = callLogsList.map((callLog: any) => ({
      ...callLog,
      id: callLog._id.toString(),
    }));

    const response = {
      callLogs: formattedCallLogs,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      limit,
    };

    console.log("API: Sending response:", response);

    return NextResponse.json(response);
  } catch (error) {
    console.error("API Error fetching call logs:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
