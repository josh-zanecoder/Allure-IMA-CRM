import { NextRequest, NextResponse } from "next/server";
import connectToMongoDB from "@/lib/mongoose";
import Prospect from "@/models/Prospect";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await connectToMongoDB();

    const cookieStore = cookies();
    const userCookie = (await cookieStore).get("user")?.value;
    const tokenCookie = (await cookieStore).get("token")?.value;

    if (!userCookie || !tokenCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = JSON.parse(userCookie);

    // Find all prospects assigned to the salesperson and select only college-related fields
    const students = await Prospect.find({ "assignedTo._id": userData.id })
      .select(
        "fullName firstName lastName phone email address educationLevel dateOfBirth preferredContactMethod interests notes status lastContact addedBy assignedTo updatedBy"
      )
      .sort({ fullName: 1 })
      .lean();

    console.log("students", students);

    // Transform the data to a more suitable format for the frontend
    const formattedStudents = students.map((student) => ({
      id: (student as any)._id.toString(),
      fullName: student.fullName,
      firstName: student.firstName,
      lastName: student.lastName,
      phone: student.phone,
      email: student.email,
      address: student.address,
      educationLevel: student.educationLevel,
      dateOfBirth: student.dateOfBirth,
      preferredContactMethod: student.preferredContactMethod,
      interests: student.interests,
      location: {
        street: student.address.street,
        city: student.address.city,
        state: student.address.state,
        zip: student.address.zip,
      },
      notes: student.notes,
      status: student.status,
      lastContact: student.lastContact,
      addedBy: student.addedBy,
      assignedTo: student.assignedTo,
      updatedBy: student.updatedBy,
    }));

    return NextResponse.json({
      students: formattedStudents,
      totalCount: formattedStudents.length,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
