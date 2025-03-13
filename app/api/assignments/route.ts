import { NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import { Assignment } from "../../../lib/models/assignment";

export async function GET() {
  await dbConnect();

  try {
    const assignments = await Assignment.find({ status: "success" })
    .populate({
      path: "orderId",
      model: "Order", // Ensure Mongoose uses the correct model
      select: "orderNumber customer area totalAmount status", // Fetch only required fields
    })
    .lean(); // Convert Mongoose objects to plain JSON
  
  

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
