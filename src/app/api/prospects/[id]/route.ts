import { NextResponse } from "next/server";
import connectToMongoDB from "@/lib/mongoose";
import Prospect from "@/models/Prospect";
import Activity from "@/models/Activity";
import Reminder from "@/models/Reminder";
import mongoose from "mongoose";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid prospect ID format" },
        { status: 400 }
      );
    }

    await connectToMongoDB();

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Delete the prospect from the database
      const prospect = await Prospect.findById(id).session(session);

      if (!prospect) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json(
          { error: "Prospect not found" },
          { status: 404 }
        );
      }

      // Delete related activities
      const deletedActivities = await Activity.deleteMany({
        prospectId: id,
      }).session(session);

      // Delete related reminders
      const deletedReminders = await Reminder.deleteMany({
        prospectId: id,
      }).session(session);

      // Delete the prospect
      await prospect.deleteOne({ session });

      // Check if CallActivity model exists in the project
      let deletedCallActivities = { deletedCount: 0 };
      try {
        const CallActivity = mongoose.model("CallActivity");
        deletedCallActivities = await CallActivity.deleteMany({
          prospectId: id,
        }).session(session);
      } catch (error) {
        // Model doesn't exist or other error, continue without deleting call activities
      }

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      return NextResponse.json(
        {
          message: "Prospect and related data deleted successfully",
          details: {
            prospect: 1,
            activities: deletedActivities.deletedCount,
            reminders: deletedReminders.deletedCount,
            callActivities: deletedCallActivities.deletedCount,
          },
        },
        { status: 200 }
      );
    } catch (error) {
      // If anything goes wrong, abort the transaction
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Error deleting prospect:", error);
    return NextResponse.json(
      { error: "Failed to delete prospect and related data" },
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
