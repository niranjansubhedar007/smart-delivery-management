// app/api/orders/route.ts
import { NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import { Order } from "../../../lib/models/order";



interface OrderQuery {
  status?: { $in: string[] };
  area?: { $in: string[] };
  scheduledFor?: { $gte: Date };
}

export async function GET(req: Request) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.getAll('status');
    const areas = searchParams.getAll('area');
    const date = searchParams.get('date');

    const query: OrderQuery = {};
    
    if (status.length) query.status = { $in: status };
    if (areas.length) query.area = { $in: areas };
    if (date) query.scheduledFor = { $gte: new Date(date) };

    const orders = await Order.find(query)
      .sort({ scheduledFor: 1 })
      .populate('assignedTo', 'name phone');

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();

    // Find the last order and increment order number
    const lastOrder = await Order.findOne().sort({ createdAt: -1 });

    let newOrderNumber = 1; // Start from 1 if no orders exist
    if (lastOrder) {
      newOrderNumber = parseInt(lastOrder.orderNumber) + 1; // Increment last order number
    }

    const newOrder = await Order.create({
      ...body,
      orderNumber: newOrderNumber.toString(), // Convert to string for consistency
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}