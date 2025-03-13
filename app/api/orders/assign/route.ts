// app/api/orders/assign/route.ts
import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongodb";
import { Order } from "../../../../lib/models/order";
import { Partner } from "../../../../lib/models/partner";

// app/api/orders/assign/route.ts
export async function POST(req: Request) {
  await dbConnect();
  const { orderId, partnerId } = await req.json();

  try {
    // Update the order first
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { 
        assignedTo: partnerId,
        status: 'assigned',
        $push: { statusHistory: { status: 'assigned', timestamp: new Date() } }
      },
      { new: true }
    ).populate('assignedTo', 'name phone');

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update partner status to inactive
    const updatedPartner = await Partner.findByIdAndUpdate(
      partnerId,
      { status: 'inactive' },
      { new: true }
    );

    if (!updatedPartner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error fetching metrics:', error); // Add error logging
    return NextResponse.json(
      { error: "Failed to fetch assignment metrics", details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}


export async function GET() {
  await dbConnect();

  try {
    // Fetch only orders with status "assigned"
    const assignedOrders = await Order.find({ status: "assigned" }).lean();

    console.log("Assigned Orders:", assignedOrders); // Debugging

    return NextResponse.json(assignedOrders);
  } catch (error) {
    console.error("Error fetching assigned orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch assigned orders", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
