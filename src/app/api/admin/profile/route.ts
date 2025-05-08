import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectToMongoDB from "@/lib/mongoose";
import { UserModel } from "@/models/User";

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

    // Verify this is an admin user
    if (userData.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch additional user data from MongoDB if needed
    let additionalData = {};
    try {
      if (userData.id) {
        const dbUser = await UserModel.findById(userData.id);
        if (dbUser) {
          additionalData = {
            status: dbUser.status,
            // Add any other fields from the database as needed
          };
        }
      }
    } catch (dbError) {
      console.error("Error fetching user data from database:", dbError);
      // Continue with the data we have from the cookie
    }

    // Return the combined user data
    return NextResponse.json({
      user: {
        ...userData,
        ...additionalData,
      },
    });
  } catch (error) {
    console.error("Error in admin profile route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectToMongoDB();

    const cookieStore = cookies();
    const userCookie = (await cookieStore).get("user")?.value;
    const tokenCookie = (await cookieStore).get("token")?.value;

    if (!userCookie || !tokenCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = JSON.parse(userCookie);

    // Verify this is an admin user
    if (userData.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get the profile data from the request
    const profileData = await request.json();

    // For now, we're just returning the data as if it was successfully updated
    // In a real implementation, you would update the data in your database

    return NextResponse.json({
      user: {
        ...userData,
        firstName: profileData.firstName || userData.firstName,
        lastName: profileData.lastName || userData.lastName,
        email: profileData.email || userData.email,
        phone: profileData.phone || userData.phone,
      },
    });
  } catch (error) {
    console.error("Error in admin profile update route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
