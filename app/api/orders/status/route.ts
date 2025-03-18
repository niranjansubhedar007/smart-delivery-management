import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongodb";
import { Order } from "../../../../lib/models/order";
import { Assignment } from "../../../../lib/models/assignment";

export async function PUT(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("orderId");
    const { status } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    console.log("Updating order:", id, "New Status:", status);

    // Update order status
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        status,
        $push: { statusHistory: { status, timestamp: new Date() } },
      },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Handle assignment updates based on status
    if (status === "assigned") {
      // Create assignment if order is assigned
      await Assignment.create({
        orderId: id,
        partnerId: updatedOrder.assignedTo,
        status: "assigned",
      });
    } else if (["picked", "delivered", "undelivered"].includes(status)) {
      // Update assignment status if order is updated
      await Assignment.findOneAndUpdate(
        { orderId: id },
        { status },
        { new: true }
      );
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Failed to update status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
