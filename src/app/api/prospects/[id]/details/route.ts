import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { unformatPhoneNumber } from "@/utils/formatters";
import mongoose from "mongoose";
import connectDB from "@/lib/mongoose";
import Prospect from "@/models/Prospect";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    console.log("GET - Prospect ID:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("GET - Invalid ID format:", id);
      return NextResponse.json(
        { error: "Invalid prospect ID" },
        { status: 400 }
      );
    }

    await connectDB();
    const prospect = await Prospect.findById(id);
    console.log("GET - Found prospect:", prospect);

    if (!prospect) {
      return NextResponse.json(
        { error: "Prospect not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(prospect);
  } catch (error) {
    console.log("GET - Error details:", error);
    console.error("Error fetching prospect:", error);
    return NextResponse.json(
      { error: "Failed to fetch prospect" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    console.log("PUT - Prospect ID:", id);

    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user")?.value;
    console.log("PUT - User cookie:", userCookie);

    const userData = JSON.parse(userCookie || "{}");
    const updatedData = await request.json();
    console.log("PUT - Update data:", updatedData);

    // Phone formatting
    if (updatedData.phone) {
      updatedData.phone = unformatPhoneNumber(updatedData.phone);
    }

    // Clear genderOther if gender is not 'Other'
    if (updatedData.gender && updatedData.gender !== "Other") {
      updatedData.genderOther = "";
    }

    // validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (updatedData.phone && updatedData.phone.length < 10) {
      return NextResponse.json(
        { error: "Phone number must be at least 10 digits" },
        { status: 400 }
      );
    }

    // Validate zip only if provided
    if (updatedData.address?.zip && !/^\d+$/.test(updatedData.address.zip)) {
      return NextResponse.json(
        { error: "ZIP code must contain only numbers" },
        { status: 400 }
      );
    }

    if (updatedData.email && !emailRegex.test(updatedData.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    await connectDB();
    console.log("PUT - Connected to DB, updating prospect");

    const userInfo = {
      id: userData.uid,
      email: userData.email,
      role: userData.role,
    };

    // Log the specific campus field before update
    console.log("PUT - Campus before update:", updatedData.campus);
    console.log("PUT - Campus type:", typeof updatedData.campus);

    // Create the update object
    const updatePayload = {
      ...updatedData,
      fullName: `${updatedData.firstName} ${updatedData.lastName}`,
      updatedBy: userInfo,
      updatedAt: new Date(),
    };

    // Explicitly handle campus field
    if (updatedData.campus) {
      updatePayload.campus = updatedData.campus;
      console.log("PUT - Campus set in update payload:", updatePayload.campus);
    }

    console.log(
      "PUT - Final update payload:",
      JSON.stringify(updatePayload, null, 2)
    );

    // First find the prospect
    const prospect = await Prospect.findById(id);
    if (!prospect) {
      return NextResponse.json(
        { error: "Prospect not found" },
        { status: 404 }
      );
    }

    // Update all fields
    Object.keys(updatePayload).forEach((key) => {
      if (key !== "_id" && key !== "id") {
        prospect[key] = updatePayload[key];
      }
    });

    // Explicitly set the campus field to ensure it gets saved
    if (updatePayload.campus) {
      prospect.set("campus", updatePayload.campus, { strict: false });
      console.log("PUT - Manually set campus field:", prospect.get("campus"));
    }

    // Save the updated prospect
    const savedProspect = await prospect.save();

    console.log("PUT - Updated prospect:", savedProspect);
    console.log(
      "PUT - Campus in updated prospect:",
      savedProspect.get("campus")
    );

    // Create response object
    const responseObj = {
      ...savedProspect.toObject(),
      id: savedProspect._id.toString(),
    };

    // Remove the _id field to avoid duplicates
    delete responseObj._id;

    console.log("PUT - Response object:", JSON.stringify(responseObj, null, 2));
    console.log("PUT - Campus in response:", responseObj.campus);

    // If campus is lost in the process, add it back
    if (!responseObj.campus && updatePayload.campus) {
      console.log(
        "PUT - Adding missing campus to response:",
        updatePayload.campus
      );
      responseObj.campus = updatePayload.campus;
    }

    return NextResponse.json(responseObj);
  } catch (error) {
    console.log("PUT - Error details:", error);
    console.error("Error updating prospect:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
