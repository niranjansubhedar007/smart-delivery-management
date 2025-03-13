// // app/api/assignments/run/route.ts
// import { NextResponse } from "next/server";
// import dbConnect from "../../../../lib/mongodb";
// import { Order } from "../../../../lib/models/order";
// import { Partner } from "../../../../lib/models/partner";
// import { Assignment } from "../../../../lib/models/assignment";

// export async function POST() {
//   await dbConnect();

//   try {
//     // Get all pending orders
//     const orders = await Order.find({ status: "pending" });

//     if (orders.length === 0) {
//       return NextResponse.json({ message: "No pending orders to assign" });
//     }

//     // Get available partners sorted by currentLoad (least busy first)
//     const partners = await Partner.find({ status: "active" }).sort({ currentLoad: 1 });

//     if (partners.length === 0) {
//       return NextResponse.json({ message: "No available partners" });
//     }

//     const assignments = [];

//     for (const order of orders) {
//       const partner = partners.find(p => p.currentLoad < 3); // Assign only if load < 3

//       if (!partner) break; // Stop if no available partners

//       order.assignedTo = partner._id;
//       order.status = "assigned";
//       await order.save();

//       partner.currentLoad += 1;
//       await partner.save();

//       assignments.push({
//         orderId: order._id,
//         partnerId: partner._id,
//         timestamp: new Date(),
//         status: "success",
//       });

//       await Assignment.create(assignments);
//     }

//     return NextResponse.json({ message: "Orders assigned successfully", assignments });
//   } catch (error) {
//     console.error('Error fetching metrics:', error); // Add error logging
//     return NextResponse.json(
//       { error: "Failed to fetch assignment metrics", details: error instanceof Error ? error.message : 'Unknown error' }, 
//       { status: 500 }
//     );
//   }
// }





import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongodb";
import { Assignment } from "../../../../lib/models/assignment";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { orderId, partnerId, status, reason } = await req.json();

    if (!orderId || !partnerId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newAssignment = await Assignment.create({
      orderId,
      partnerId,
      status,
      reason,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true, assignment: newAssignment });
  } catch (error) {
    console.error("Error creating assignment:", error);
    return NextResponse.json(
      { error: "Failed to create assignment", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
