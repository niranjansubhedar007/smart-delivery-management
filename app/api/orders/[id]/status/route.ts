// // app/api/orders/[id]/status/route.ts
// import { NextResponse } from "next/server";
// import dbConnect from "../../../../../lib/mongodb";
// import { Order } from "../../../../../lib/models/order";

// export async function PUT(req: Request, { params }: { params: { id: string } }) {
//   await dbConnect();
//   const { id } = params;
//   const { status } = await req.json();

//   try {
//     const validStatus = ['pending', 'assigned', 'picked', 'delivered'];
//     if (!validStatus.includes(status)) {
//       return NextResponse.json({ error: "Invalid status" }, { status: 400 });
//     }

//     const updatedOrder = await Order.findByIdAndUpdate(
//       id,
//       { 
//         status,
//         $push: { statusHistory: { status, timestamp: new Date() } }
//       },
//       { new: true }
//     ).populate('assignedTo', 'name phone');

//     if (!updatedOrder) {
//       return NextResponse.json({ error: "Order not found" }, { status: 404 });
//     }

//     return NextResponse.json(updatedOrder);
//   } catch (error) {
//     return NextResponse.json(
//       { error: "Failed to update status" },
//       { status: 500 }
//     );
//   }
// }

// app/api/orders/[id]/status/route.tsimport { NextResponse } from "next/server";
import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/mongodb";
import { Order } from "../../../../../lib/models/order";
import { Assignment } from "../../../../../lib/models/assignment";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params;
  const { status } = await req.json();

  try {
    const validStatus = ["pending", "assigned", "picked", "delivered", "undelivered"];
    if (!validStatus.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // If the request is to set status as 'undelivered', check for failed assignments
    if (status === "undelivered") {
      const failedAssignment = await Assignment.findOne({ orderId: id, status: "failed" });

      if (!failedAssignment) {
        return NextResponse.json(
          { error: "Assignment is not failed, cannot update to 'undelivered'" },
          { status: 400 }
        );
      }
    }

    // Update order status
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { 
        status,
        $push: { statusHistory: { status, timestamp: new Date() } }
      },
      { new: true }
    ).populate("assignedTo", "name phone");

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Failed to update status:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}
