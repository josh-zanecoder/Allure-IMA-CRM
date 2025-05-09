import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectToMongoDB from "@/lib/mongoose";
import Prospect from "@/models/Prospect";
import { unformatPhoneNumber } from "@/utils/formatters";
import { ObjectId } from "mongodb";
import { CAMPUS } from "@/types/prospect";

export async function POST(request: NextRequest) {
  try {
    await connectToMongoDB(); // ✅ use the same connection

    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user");

    const userData = JSON.parse(userCookie?.value || "");
    const data = await request.json();

    console.log("Creating prospect with data:", JSON.stringify(data, null, 2));
    console.log("Campus value:", data.campus, "Type:", typeof data.campus);
    console.log("Campus field exists:", "campus" in data);

    // Ensure campus is a valid value or undefined
    if (data.campus === "") {
      data.campus = undefined;
    } else if (data.campus) {
      // Validate that campus is a valid value
      const validCampuses = Object.values(CAMPUS);
      if (!validCampuses.includes(data.campus)) {
        console.log("Invalid campus value:", data.campus);
        console.log("Valid campus values:", validCampuses);
        data.campus = undefined;
      }
    }

    // Check if a prospect with the same email or phone already exists
    if (data.email) {
      const existingProspectWithEmail = await Prospect.findOne({
        email: data.email,
      });
      if (existingProspectWithEmail) {
        return NextResponse.json(
          { error: "A student with this email already exists" },
          { status: 400 }
        );
      }
    }

    if (data.phone) {
      const formattedPhone = unformatPhoneNumber(data.phone);
      const existingProspectWithPhone = await Prospect.findOne({
        phone: formattedPhone,
      });
      if (existingProspectWithPhone) {
        return NextResponse.json(
          { error: "A student with this phone number already exists" },
          { status: 400 }
        );
      }

      // Format the phone number after checking for duplicates
      data.phone = formattedPhone;
    }

    const requiredFields = ["firstName", "lastName", "phone"];
    const missingFields = requiredFields.filter((field) => !data[field]);

    console.log("data", data);
    console.log("missingFields", missingFields);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (data.email && !emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (data.address?.zip && !/^\d+$/.test(data.address.zip)) {
      return NextResponse.json(
        { error: "ZIP code must contain only numbers" },
        { status: 400 }
      );
    }

    if (data.phone.length < 10) {
      return NextResponse.json(
        { error: "Phone number must be at least 10 digits" },
        { status: 400 }
      );
    }

    const userInfo = {
      _id: new ObjectId(userData.id),
      id: userData.uid,
      email: userData.email,
      role: userData.role,
    };

    try {
      // Ensure lastContact is a proper Date object
      const lastContactDate = data.lastContact
        ? new Date(data.lastContact)
        : new Date();

      // Ensure interests is an array
      const interests = Array.isArray(data.interests) ? data.interests : [];

      // Log the final data before creating the prospect
      console.log("Final data before creating prospect:", {
        ...data,
        interests,
        campus: data.campus,
        fullName: `${data.firstName} ${data.lastName}`,
        lastContact: lastContactDate,
      });

      // Specific logging for campus
      console.log("Campus value right before creating:", data.campus);
      console.log("Campus value type:", typeof data.campus);
      console.log(
        "Is valid campus value:",
        data.campus ? Object.values(CAMPUS).includes(data.campus) : false
      );

      // Prepare prospect data as a plain JavaScript object
      const prospectData = {
        ...data,
        interests,
        fullName: `${data.firstName} ${data.lastName}`,
        status: data.status || "New",
        lastContact: lastContactDate,
        addedBy: userInfo,
        assignedTo: userInfo,
      };

      // We'll explicitly ensure the campus field is set if it has a value
      if (data.campus) {
        // Make sure it's directly set on the document
        prospectData.campus = data.campus;
      }

      console.log(
        "Final prospect data:",
        JSON.stringify(prospectData, null, 2)
      );

      // Explicitly log the campus field to be saved
      console.log("Campus to be saved:", prospectData.campus);

      // Create the prospect as a Mongoose document
      const newProspect = new Prospect(prospectData);

      // Double-check the campus field is set on the document
      if (data.campus) {
        // Direct assignment to ensure it's included
        newProspect.set("campus", data.campus, { strict: false });
        console.log("Set campus field manually:", newProspect.get("campus"));
      }

      // Save the document
      const savedProspect = await newProspect.save();

      // Check if campus was saved correctly
      console.log("Created prospect:", JSON.stringify(savedProspect, null, 2));
      console.log("Campus in created prospect:", savedProspect.get("campus"));

      // Create the response object and ensure campus is included
      const responseObj = {
        ...savedProspect.toObject(),
        id: savedProspect._id.toString(),
      };

      // Remove the _id field to avoid duplicates
      delete responseObj._id;

      console.log(
        "Response object before sending:",
        JSON.stringify(responseObj, null, 2)
      );
      console.log("Campus in response object:", responseObj.campus);

      // As a failsafe, add the campus from the original data if it's missing in the response
      if (!responseObj.campus && data.campus) {
        console.log("Adding missing campus to response:", data.campus);
        responseObj.campus = data.campus;
      }

      return NextResponse.json(responseObj, { status: 201 });
    } catch (dbError) {
      console.error("Database error creating prospect:", dbError);
      return NextResponse.json(
        {
          error: "Database Error",
          details: dbError instanceof Error ? dbError.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error creating prospect:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
