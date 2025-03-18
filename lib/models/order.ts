


// lib/models/order.ts
import { Document, Schema, model, models } from "mongoose";

// 1. Define interface for Order document
interface IOrder extends Document {
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  area: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  status: "pending" | "assigned" | "picked" | "delivered";
  scheduledFor: Date;
  assignedTo?: Schema.Types.ObjectId;
  totalAmount: number;
  statusHistory: Array<{
    status: string;
    timestamp: Date;
  }>;
}

// 2. Create Mongoose schema
const OrderSchema = new Schema<IOrder>({
  orderNumber: { type: String, required: true, unique: true },
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
  },
  area: { type: String, required: true },
  items: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  status: {
    type: String,
    enum: ["pending", "assigned", "picked", "delivered"],
    default: "pending",
  },
  scheduledFor: { type: Date, required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: "Partner" },
  totalAmount: { type: Number, required: true },
  statusHistory: [
    {
      status: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

// 3. Add pre-save hook with proper typing
OrderSchema.pre<IOrder>("save", function(next) {
  if (this.isModified("status")) {
    this.statusHistory = this.statusHistory || [];
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date()
    });
  }
  next();
});

// 4. Create/Get model with proper typing
const Order = models.Order || model<IOrder>("Order", OrderSchema);

// 5. Export types and model
export type { IOrder };
export { Order };


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

// import { NextRequest, NextResponse } from "next/server";
// import dbConnect from "../../../../../lib/mongodb";
// import { Order } from "../../../../../lib/models/order";
// import { Assignment } from "../../../../../lib/models/assignment";

// interface RequestBody {
//   status: "picked" | "delivered" | "undelivered";
// }

// export async function PUT(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     // First access params synchronously
//     const { id } = params;
    
//     await dbConnect();
//     const { status } = await req.json() as RequestBody;

//     // Validate status
//     const validStatus: Array<RequestBody["status"]> = ["picked", "delivered", "undelivered"];
//     if (!validStatus.includes(status)) {
//       return NextResponse.json(
//         { error: "Invalid status value" }, 
//         { status: 400 }
//       );
//     }

//     // Check for failed assignment if marking as undelivered
//     if (status === "undelivered") {
//       const failedAssignment = await Assignment.findOne({ 
//         orderId: id, 
//         status: "failed" 
//       });
      
//       if (!failedAssignment) {
//         return NextResponse.json(
//           { error: "Cannot mark as undelivered without failed assignment" },
//           { status: 400 }
//         );
//       }
//     }

//     // Update the order
//     const updatedOrder = await Order.findByIdAndUpdate(
//       id,
//       { 
//         status,
//         $push: { statusHistory: { status, timestamp: new Date() } }
//       },
//       { new: true }
//     ).populate("assignedTo", "name phone");

//     if (!updatedOrder) {
//       return NextResponse.json(
//         { error: "Order not found" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({ 
//       success: true, 
//       order: updatedOrder 
//     });

//   } catch (error) {
//     console.error("Update error:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }