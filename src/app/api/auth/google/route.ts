import { NextResponse } from "next/server";
import connectToMongoDB from "@/lib/mongoose";
import { UserModel } from "@/models/User";
import { SalesPersonModel } from "@/models/SalesPerson";
import { adminAuth } from "@/lib/firebase-admin";

// Add dynamic configuration
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { uid, email, token } = body;

    if (!uid || !email || !token) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the Firebase token
    try {
      await adminAuth.verifyIdToken(token);
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectToMongoDB();

    // Find user in MongoDB
    const userRecord = await UserModel.findOne({ firebase_uid: uid });

    if (!userRecord) {
      // Delete the user from Firebase Auth if they don't exist in MongoDB
      try {
        await adminAuth.deleteUser(uid);
      } catch (firebaseError) {
        console.error("Error deleting user from Firebase Auth:", firebaseError);
      }

      return NextResponse.json(
        {
          error: "Account not registered. Please contact administrator.",
          exists: false,
        },
        { status: 404 }
      );
    }

    // Get additional user data from salespersons collection if needed
    const salesperson =
      userRecord.role === "salesperson"
        ? await SalesPersonModel.findOne({ firebase_uid: uid })
        : null;

    return NextResponse.json({
      exists: true,
      firstName: salesperson?.first_name || null,
      lastName: salesperson?.last_name || null,
      role: userRecord.role,
      id: salesperson?._id || null,
      twilioNumber: salesperson?.twilio_number || null,
    });
  } catch (error) {
    console.error("Google auth error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
