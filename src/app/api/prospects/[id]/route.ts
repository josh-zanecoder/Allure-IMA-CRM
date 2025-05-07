import { NextResponse } from "next/server";
import connectToMongoDB from "@/lib/mongoose";
import Prospect from "@/models/Prospect";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await connectToMongoDB();

    // Delete the prospect from the database
    const result = await Prospect.findByIdAndDelete(id);

    if (!result) {
      return NextResponse.json(
        { error: "Prospect not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Prospect deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting prospect:", error);
    return NextResponse.json(
      { error: "Failed to delete prospect" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    await connectToMongoDB();

    // Check if email exists in the database
    const existingProspect = await Prospect.findOne({ email });

    return NextResponse.json({ exists: !!existingProspect }, { status: 200 });
  } catch (error) {
    console.error("Error checking email:", error);
    return NextResponse.json(
      { error: "Failed to check email" },
      { status: 500 }
    );
  }
}
