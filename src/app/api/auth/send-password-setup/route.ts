import { NextResponse } from "next/server";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "@/lib/firebase";

// Initialize a Firebase app instance for this API route
// This is needed because we're in a server component
const app = initializeApp(firebaseConfig, "password-reset-app");
const auth = getAuth(app);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Create the action code settings
    const actionCodeSettings = {
      // URL in the email to redirect to after password reset
      url: `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/login`,
      handleCodeInApp: false,
    };

    // Send password reset email using the client SDK
    await sendPasswordResetEmail(auth, email, actionCodeSettings);

    console.log(`Password reset email sent to ${email}`);

    return NextResponse.json(
      { message: "Password setup email sent successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error sending password setup email:", error);

    // Handle different error cases
    if (error.code === "auth/user-not-found") {
      return NextResponse.json(
        { error: "No user found with this email" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to send password setup email", details: error.message },
      { status: 500 }
    );
  }
}
