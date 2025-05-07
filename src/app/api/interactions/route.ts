import { NextResponse } from "next/server";
import connectToMongoDB from "@/lib/mongoose";
import {
  InteractionRecord,
  InteractionType,
  InteractionStatus,
} from "@/models/InteractionRecord";

// Create a new interaction record
export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    console.log("Interaction record request body:", body);

    const {
      userId,
      prospectId,
      interactionType,
      subject,
      details,
      status,
      extraData,
    } = body;

    // Validate required fields
    if (!userId || !prospectId || !subject || !details) {
      console.error("Missing required fields:", {
        userId,
        prospectId,
        subject,
        details,
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectToMongoDB();

    // Generate a unique interactionId if not provided
    const interactionId =
      body.interactionId ||
      `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Prepare interaction data
    const interactionData = {
      userId,
      prospectId,
      interactionId,
      interactionType: interactionType || InteractionType.OTHER,
      subject,
      details,
      status: status || InteractionStatus.INITIATED,
      startTime: body.startTime || new Date(),
      endTime: body.endTime,
      duration: body.duration,
      extraData: extraData || {},
    };

    // Create new interaction record
    const interaction = await InteractionRecord.create(interactionData);
    console.log("Interaction record created successfully:", interaction);

    return NextResponse.json(interaction, { status: 201 });
  } catch (error: any) {
    console.error("Error creating interaction record:", error);

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
        error: "Failed to create interaction record",
        message: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Get interaction records with flexible filtering
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract filter parameters
    const userId = searchParams.get("userId");
    const prospectId = searchParams.get("prospectId");
    const interactionType = searchParams.get("interactionType");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Extract pagination parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // Connect to MongoDB
    await connectToMongoDB();

    // Build query filters
    const query: any = {};
    if (userId) query.userId = userId;
    if (prospectId) query.prospectId = prospectId;
    if (interactionType) query.interactionType = interactionType;
    if (status) query.status = status;

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Count total matching documents for pagination
    const total = await InteractionRecord.countDocuments(query);

    // Get interaction records with pagination
    const interactions = await InteractionRecord.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Return interactions with pagination metadata
    return NextResponse.json(
      {
        interactions,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching interaction records:", error);
    return NextResponse.json(
      { error: "Failed to fetch interaction records", message: error.message },
      { status: 500 }
    );
  }
}
