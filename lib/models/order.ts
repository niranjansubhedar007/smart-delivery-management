// const mongoose = require("mongoose");
// const OrderSchema = new mongoose.Schema({
//   orderNumber: { type: String, required: true, unique: true },
//   customer: {
//     name: { type: String, required: true },
//     phone: { type: String, required: true },
//     address: { type: String, required: true },
//   },
//   area: { type: String, required: true },
//   items: [
//     {
//       name: { type: String, required: true },
//       quantity: { type: Number, required: true },
//       price: { type: Number, required: true },
//     },
//   ],
//   status: {
//     type: String,
//     enum: ["pending", "assigned", "picked", "delivered"],
//     default: "pending",
//   },
//   scheduledFor: { type: String, required: true },
//   assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Partner" },
//   totalAmount: { type: Number, required: true },
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now },
// });
// export const Order =
//   mongoose.models.Order || mongoose.model("Order", OrderSchema);



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