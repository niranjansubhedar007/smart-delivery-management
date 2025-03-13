// import mongoose, { Schema, model, models } from "mongoose";

// const PartnerSchema = new Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   phone: { type: String, required: true },
//   status: { type: String, enum: ["active", "inactive"], default: "active" },
//   currentLoad: { type: Number, default: 0 },
//   areas: { type: [String], required: true },
//   shift: {
//     start: { type: String, required: true },
//     end: { type: String, required: true },
//   },
//   metrics: {
//     rating: { type: Number, default: 0 },
//     completedOrders: { type: Number, default: 0 },
//     cancelledOrders: { type: Number, default: 0 },
//   },
// });

// export const Partner = models.Partner || model("Partner", PartnerSchema);



import { Schema, model, models } from "mongoose"; // Remove unused mongoose import

const PartnerSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  currentLoad: { type: Number, default: 0 },
  areas: { type: [String], required: true },
  shift: {
    start: { type: String, required: true },
    end: { type: String, required: true },
  },
  metrics: {
    rating: { type: Number, default: 0 },
    completedOrders: { type: Number, default: 0 },
    cancelledOrders: { type: Number, default: 0 },
  },
});

export const Partner = models.Partner || model("Partner", PartnerSchema);