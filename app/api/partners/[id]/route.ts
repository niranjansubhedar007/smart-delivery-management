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





import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongodb";
import { Partner } from "../../../../lib/models/partner";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params;
  const body = await req.json();

  try {
    // Ensure all fields exist, including shift
    const updateData = {
      name: body.name || "",
      email: body.email || "",
      phone: body.phone || "",
      areas: Array.isArray(body.areas) ? body.areas : [],
      shift: {
        start: body.shift?.start || "", // Ensure shift.start is defined
        end: body.shift?.end || "",
      },
      status: body.status || "active",
    };

    const updatedPartner = await Partner.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedPartner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }
    return NextResponse.json(updatedPartner);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update partner" }, { status: 500 });
  }
}


export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params;

  try {
    const deletedPartner = await Partner.findByIdAndDelete(id);
    if (!deletedPartner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Partner deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Failed to delete partner" }, { status: 500 });
  }
}
