// lib/models/assignment.ts
import mongoose, { Schema, model, models } from "mongoose";

const AssignmentSchema = new Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: "Partner", required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ["success", "failed"], required: true },
  reason: { type: String }
});

export const Assignment = models.Assignment || model("Assignment", AssignmentSchema);
