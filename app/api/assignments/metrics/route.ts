


import { NextResponse } from "next/server";
import mongoose from "mongoose"; // ✅ Fix: Import mongoose
import dbConnect from "../../../../lib/mongodb";
import { Assignment } from "../../../../lib/models/assignment";

export async function GET(req: Request) {
  await dbConnect();

  try {
    console.log("Fetching assignment metrics...");
    
    const url = new URL(req.url);
    const partnerId = url.searchParams.get("partnerId");


    const query = partnerId ? { partnerId: new mongoose.Types.ObjectId(partnerId) } : {};

    // Total assignments count
    const totalAssigned = await Assignment.countDocuments(query);
    
    // Successful assignments count
    const successfulAssignments = await Assignment.countDocuments({ ...query, status: "success" });

    // Calculate success rate
    const successRate = totalAssigned > 0 ? (successfulAssignments / totalAssigned) * 100 : 0;

    // ✅ Aggregate to get completed & cancelled orders by partner
    const partnerStats = await Assignment.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$partnerId",
          completedOrders: { $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] } },
          cancelledOrders: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
        },
      },
    ]);


    // Convert stats into an object for easy lookup
    const partnerMetrics = partnerStats.reduce((acc, stat) => {
      acc[stat._id.toString()] = { // ✅ Ensure it's a string
        completedOrders: stat.completedOrders,
        cancelledOrders: stat.cancelledOrders,
      };
      return acc;
    }, {});

    // ✅ Fetch all assignments
    const assignments = await Assignment.find(query)
      .populate("orderId", "orderNumber customer area totalAmount status") // Get order details
      .lean();

    return NextResponse.json({
      totalAssigned,
      successRate,
      assignments,
      partnerMetrics, // Include partner-level stats
    });
  } catch (error) {
    console.error("Error fetching assignment metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignment metrics", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
