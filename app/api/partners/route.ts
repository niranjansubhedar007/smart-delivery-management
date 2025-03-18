

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


// // app/api/partners/[id]/route.ts (handles PUT and DELETE)
// import { NextResponse } from "next/server";
// import dbConnect from "../../../../lib/mongodb";
// import { Partner } from "../../../../lib/models/partner";

// export async function PUT(req: Request, { params }: { params: { id: string } }) {
//   await dbConnect();
//   const body = await req.json();
//   const { id } = params;

//   try {
//     const updatedPartner = await Partner.findByIdAndUpdate(id, body, { new: true });
//     if (!updatedPartner) {
//       return NextResponse.json({ error: "Partner not found" }, { status: 404 });
//     }
//     return NextResponse.json(updatedPartner);
//   } catch (error) {
//     return NextResponse.json({ error: "Failed to update partner" }, { status: 500 });
//   }
// }

// export async function DELETE(req: Request, { params }: { params: { id: string } }) {
//   await dbConnect();
//   const { id } = params;

//   try {
//     const deletedPartner = await Partner.findByIdAndDelete(id);
//     if (!deletedPartner) {
//       return NextResponse.json({ error: "Partner not found" }, { status: 404 });
//     }
//     return NextResponse.json({ message: "Partner deleted successfully" });
//   } catch (error) {
//     return NextResponse.json({ error: "Failed to delete partner" }, { status: 500 });
//   }
// }





// import { NextResponse } from "next/server";
// import dbConnect from "../../../../lib/mongodb";
// import { Partner } from "../../../../lib/models/partner";

// export async function PUT(req: Request, { params }: { params: { id: string } }) {
//   await dbConnect();
//   const { id } = params;
//   const body = await req.json();

//   try {
//     // Ensure all fields exist, including shift
//     const updateData = {
//       name: body.name || "",
//       email: body.email || "",
//       phone: body.phone || "",
//       areas: Array.isArray(body.areas) ? body.areas : [],
//       shift: {
//         start: body.shift?.start || "", // Ensure shift.start is defined
//         end: body.shift?.end || "",
//       },
//       status: body.status || "active",
//     };

//     const updatedPartner = await Partner.findByIdAndUpdate(id, updateData, { new: true });

//     if (!updatedPartner) {
//       return NextResponse.json({ error: "Partner not found" }, { status: 404 });
//     }
//     return NextResponse.json(updatedPartner);
//   } catch (error) {
//     console.error("Error updating partner:", error); // Log the error
//     return NextResponse.json({ error: "Failed to update partner" }, { status: 500 });
//   }
// }


// export async function DELETE(req: Request, { params }: { params: { id: string } }) {
//   await dbConnect();
//   const { id } = params;

//   try {
//     const deletedPartner = await Partner.findByIdAndDelete(id);
//     if (!deletedPartner) {
//       return NextResponse.json({ error: "Partner not found" }, { status: 404 });
//     }
//     return NextResponse.json({ message: "Partner deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting partner:", error); // Log the error
//     return NextResponse.json({ error: "Failed to delete partner" }, { status: 500 });
//   }
// }




export async function PUT(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    console.log("Received PUT Request:", body); // ✅ Debugging log

    const { id, name, email, phone, areas, shift, status } = body;

    if (!id) {
      return NextResponse.json({ error: "Partner ID is required" }, { status: 400 });
    }

    const updatedPartner = await Partner.findByIdAndUpdate(
      id,
      {
        name,
        email,
        phone,
        areas: Array.isArray(areas) ? areas : [],
        shift: {
          start: shift?.start || "",
          end: shift?.end || "",
        },
        status,
      },
      { new: true }
    );

    if (!updatedPartner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    return NextResponse.json(updatedPartner);
  } catch (error) {
    console.error("Error updating partner:", error);
    return NextResponse.json({ error: "Failed to update partner" }, { status: 500 });
  }
}


// Delete a Partner
export async function DELETE(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    console.log("Received DELETE Request:", body); // ✅ Debugging log

    if (!body.id) {
      return NextResponse.json({ error: "Partner ID is required" }, { status: 400 });
    }

    const deletedPartner = await Partner.findByIdAndDelete(body.id);

    if (!deletedPartner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Partner deleted successfully" });
  } catch (error) {
    console.error("Error deleting partner:", error);
    return NextResponse.json({ error: "Failed to delete partner" }, { status: 500 });
  }
}
