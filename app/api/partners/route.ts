

// api/partners/route
import { NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import { Partner } from "../../../lib/models/partner";

interface PartnerQuery {
  status?: string;
  name?: { $regex: string; $options: string }; // Case-insensitive search
}

// ✅ GET all partners (with optional filtering)
export async function GET(req: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const name = searchParams.get("name"); // Search by name

    const query: PartnerQuery = {};
    if (status) query.status = status;
    if (name) query.name = { $regex: name, $options: "i" }; // Case-insensitive name search

    // Fetch only relevant fields, including `areas`
    const partners = await Partner.find(query).select("_id name email status areas");

    return NextResponse.json(partners, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch partners:", error);
    return NextResponse.json(
      { error: "Failed to fetch partners" },
      { status: 500 }
    );
  }
}

// ✅ POST (Create a new partner)
export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: "Missing required fields (name, email)" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingPartner = await Partner.findOne({ email: body.email });
    if (existingPartner) {
      return NextResponse.json(
        { error: "Partner with this email already exists" },
        { status: 400 }
      );
    }

    const newPartner = await Partner.create(body);
    return NextResponse.json(newPartner, { status: 201 });
  } catch (error) {
    console.error("Partner creation error:", error);
    return NextResponse.json(
      { error: "Failed to create partner" },
      { status: 500 }
    );
  }
}
