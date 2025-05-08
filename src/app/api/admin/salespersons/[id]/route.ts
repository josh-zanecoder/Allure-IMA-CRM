import { NextRequest, NextResponse } from "next/server";
import connectToMongoDB from "@/lib/mongoose";
import { SalesPersonModel } from "@/models/SalesPerson";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToMongoDB();
  const { id } = await params;
  try {
    const salesperson = await SalesPersonModel.findById(id).lean();
    if (!salesperson) {
      return NextResponse.json(
        { error: "Salesperson not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(salesperson);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch salesperson" },
      { status: 500 }
    );
  }
}
