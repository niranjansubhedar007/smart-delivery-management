// api/check-dp
import { NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb"; // Adjust the path if needed

export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json({ message: "✅ Database connected successfully!" });
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return NextResponse.json({ message: "❌ Database connection failed", error }, { status: 500 });
  }
}
