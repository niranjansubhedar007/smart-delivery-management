
"use client";

import { useEffect, useState } from "react";
import Navbar from "../navbar/page";

interface Partner {
  _id: string;
  name: string;
  status: "active" | "inactive";
}

interface Order {
  _id: string;
  orderNumber: string;
  status: "pending" | "assigned" | "picked" | "delivered";
  area: string;
}

interface Metrics {
  totalOrders: number;
  successRate: number;
  activePartners: number;
  inactivePartners: number;
}

export default function Dashboard() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [partnersRes, ordersRes, metricsRes] = await Promise.all([
          fetch("/api/partners"),
          fetch("/api/orders"),
          fetch("/api/assignments/metrics"),
        ]);

        if (!partnersRes.ok || !ordersRes.ok || !metricsRes.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const partnersData = await partnersRes.json();
        const ordersData = await ordersRes.json();
        const metricsData = await metricsRes.json();

        // ✅ Dynamically calculate totalOrders & activePartners
        const totalOrders = ordersData.length;
        const activePartners = partnersData.filter((p: Partner) => p.status === "active").length;
        const inactivePartners = partnersData.filter((p: Partner) => p.status === "inactive").length;

        setPartners(partnersData);
        setOrders(ordersData);
        setMetrics({
          ...metricsData,
          totalOrders,
          activePartners,
          inactivePartners
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="p-4 bg-white shadow rounded-lg">
            <h3 className="text-lg font-bold">Total Orders</h3>
            <p className="text-2xl">{loading ? "Loading..." : metrics?.totalOrders}</p>
          </div>
          <div className="p-4 bg-white shadow rounded-lg">
            <h3 className="text-lg font-bold">Success Rate</h3>
            <p className="text-2xl">{loading ? "Loading..." : metrics?.successRate.toFixed(2) + "%"}</p>
          </div>
          <div className="p-4 bg-white shadow rounded-lg">
            <h3 className="text-lg font-bold">Active Partners</h3>
            <p className="text-2xl">{loading ? "Loading..." : metrics?.activePartners}</p>
          </div>
          <div className="p-4 bg-white shadow rounded-lg">
            <h3 className="text-lg font-bold">Inctive Partners</h3>
            <p className="text-2xl">{loading ? "Loading..." : metrics?.inactivePartners}</p>
          </div>
        </div>

        {/* Partner Availability Status */}
        <div className="bg-white p-4 shadow rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-4">Partner Availability</h2>
          <ul>
            {partners.map((partner) => (
              <li key={partner._id} className="flex justify-between p-2 border-b">
                <span>{partner.name}</span>
                <span
                  className={
                    partner.status === "active" ? "text-green-500" : "text-red-500"
                  }
                >
                  {partner.status}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent Assignments */}
        <div className="bg-white p-4 shadow rounded-lg">
          <h2 className="text-xl font-bold mb-4">Recent Assignments</h2>
          <ul>
            {orders.slice(0, 5).map((order) => (
              <li key={order._id} className="p-2 border-b">
                <strong>{order.orderNumber}</strong> - {order.status} ({order.area})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
