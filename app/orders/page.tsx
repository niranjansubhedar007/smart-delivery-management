// app/orders/page.tsx
"use client";
import { useState, useEffect } from "react";
import Navbar from "../navbar/page";

interface PartnerMetrics {
  completedOrders: number;
  cancelledOrders: number;
  successRate: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  area: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  status: "pending" | "assigned" | "picked" | "delivered" | "undelivered";

  scheduledFor: string;
  assignedTo?: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  statusHistory: {
    status: string;
    timestamp: string;
  }[];
}

interface Partner {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  areas: string[];
  metrics?: PartnerMetrics;
  shift: {
    start: string;
    end: string;
  };
  currentLoad: number;
}

interface OrdersPageProps {
  filters: {
    status: string[];
    areas: string[];
    date: string;
  };
}

export default function OrdersPage({ filters }: OrdersPageProps) {
  const defaultFilters = {
    status: filters?.status || [],
    areas: filters?.areas || [],
    date: filters?.date || "",
  };

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string[]>(
    defaultFilters.status
  );
  const [partnerMetrics, setPartnerMetrics] = useState<
    Record<string, PartnerMetrics>
  >({});
  const [selectedAreas] = useState<string[]>(defaultFilters.areas);
  const [selectedDate] = useState(defaultFilters.date);


  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnerStatusFilter, setPartnerStatusFilter] = useState("active");
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [orderFormData, setOrderFormData] = useState({
    customer: { name: "", phone: "", address: "" },
    items: [{ name: "", quantity: 1, price: 0 }],
    area: "",
    scheduledFor: "",
  });

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const params = new URLSearchParams();
        if (partnerStatusFilter) params.append("status", partnerStatusFilter);

        const res = await fetch(`/api/partners?${params.toString()}`);
        const data = await res.json();
        setPartners(data);
        console.log("data", data);
      } catch (error) {
        console.error("Failed to fetch partners:", error);
      }
    };
    fetchPartners();
  }, [partnerStatusFilter]);
  const handleNewOrder = (partner: Partner) => {
    setSelectedPartner(partner);
    setShowOrderForm(true);

    // If the partner has areas, set the first area as default
    setOrderFormData((prev) => ({
      ...prev,
      area: partner.areas.length > 0 ? partner.areas[0] : "", // Set the first area or empty if none
    }));
  };
  useEffect(() => {
    const fetchOrdersAndAssignments = async () => {
      try {
        const params = new URLSearchParams();
        selectedStatus.forEach((s) => params.append("status", s));
        selectedAreas.forEach((a) => params.append("area", a));
        if (selectedDate) params.append("date", selectedDate);
  
        const [ordersRes, assignmentsRes] = await Promise.all([
          fetch(`/api/orders?${params.toString()}`),
          fetch(`/api/assignments`), // Fetch assignments directly, not metrics
        ]);
  
        const ordersData = await ordersRes.json();
        const assignmentsData = await assignmentsRes.json();
  
        console.log("Fetched Orders:", ordersData);
        console.log("Fetched Assignments:", assignmentsData);
  
        const assignmentsArray = assignmentsData.assignments || [];
  
        const updatedOrders = ordersData.map((order: Order) => {
          const failedAssignment = assignmentsArray.find(
            (assignment: any) =>
              assignment.orderId._id === order._id && assignment.status === "failed"
          );
  
          return failedAssignment ? { ...order, status: "undelivered" } : order;
        });
  
        setOrders(updatedOrders);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch orders and assignments:", error);
        setLoading(false);
      }
    };
  
    fetchOrdersAndAssignments();
  }, [selectedStatus, selectedAreas, selectedDate]);
  
    

  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const params = new URLSearchParams();
        selectedStatus.forEach((s) => params.append("status", s));
        selectedAreas.forEach((a) => params.append("area", a));
        if (selectedDate) params.append("date", selectedDate);

        const res = await fetch(`/api/orders?${params.toString()}`);
        const data = await res.json();
        setOrders(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        setLoading(false);
      }
    };
    fetchOrders();
  }, [selectedStatus, selectedAreas, selectedDate]);
  useEffect(() => {
    const fetchPartnerMetrics = async () => {
      try {
        const res = await fetch(`/api/assignments/metrics`);
        const data = await res.json();
        setPartnerMetrics(data.partnerMetrics || {});
      } catch (error) {
        console.error("Failed to fetch partner metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartnerMetrics();
  }, []);

  // app/orders/page.tsx
  const assignOrder = async (orderId: string, partnerId: string) => {
    if (!partnerId) {
      console.error("Partner ID is required");
      return;
    }

    try {
      const res = await fetch("/api/orders/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, partnerId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to assign order");
      }

      // Update orders state
      setOrders(orders.map((order) => (order._id === orderId ? data : order)));

      // Update partners state to reflect status change
      setPartners((prevPartners) =>
        prevPartners.map((partner) =>
          partner._id === partnerId
            ? { ...partner, status: "inactive" }
            : partner
        )
      );
    } catch (error) {
      console.error("Error assigning order:", error);
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    newStatus: "picked" | "delivered" | "undelivered"
  ) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");
  
      setOrders(orders.map((order) => (order._id === orderId ? data : order)));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };
  

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Calculate total amount
      const totalAmount = orderFormData.items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );

      // Generate order number
      const generateOrderNumber = () => {
        const date = new Date();
        return `ORD-${date.getFullYear()}${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}${date
          .getDate()
          .toString()
          .padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;
      };

      // Create order payload
      const orderPayload = {
        ...orderFormData,
        orderNumber: generateOrderNumber(),
        totalAmount,
        scheduledFor: new Date(orderFormData.scheduledFor).toISOString(),
        status: "assigned",
        assignedTo: selectedPartner?._id,
        statusHistory: [
          {
            status: "assigned",
            timestamp: new Date().toISOString(),
          },
        ],
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      // Refresh orders list
      const params = new URLSearchParams();
      selectedStatus.forEach((s) => params.append("status", s));
      selectedAreas.forEach((a) => params.append("area", a));
      if (selectedDate) params.append("date", selectedDate);

      const ordersRes = await fetch(`/api/orders?${params.toString()}`);
      const ordersData = await ordersRes.json();
      setOrders(ordersData);

      // Reset form
      setShowOrderForm(false);
      setOrderFormData({
        customer: { name: "", phone: "", address: "" },
        items: [{ name: "", quantity: 1, price: 0 }],
        area: "",
        scheduledFor: "",
      });
    } catch (error) {
      console.error("Order creation failed:", error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Order Management</h1>

        {/* Filters Section */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block mb-2">Order Status</label>
              <select
                multiple
                className="w-full p-2 border rounded"
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(
                    Array.from(e.target.selectedOptions, (o) => o.value)
                  )
                }
              >
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="picked">Picked</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>

            <div>
              <label className="block mb-2">Partner Status</label>
              <select
                className="w-full p-2 border rounded"
                value={partnerStatusFilter}
                onChange={(e) => setPartnerStatusFilter(e.target.value)}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="">All</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-md mb-12">
          {loading ? (
            <p className="text-center p-6">Loading orders...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="p-4 text-left">Order #</th>
                    <th className="p-4 text-left">Customer</th>
                    <th className="p-4 text-left">Items</th>
                    <th className="p-4 text-left">Total</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order , index) => (
                    <tr key={order._id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium">Order No {index + 1}</td> 
                      <td className="p-4">
                        <div className="font-medium">{order.customer.name}</div>
                        <div className="text-sm text-gray-600">
                          {order.customer.phone}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.customer.address}
                        </div>
                      </td>
                      <td className="p-4">
                        {order.items.map((item, index) => (
                          <div key={index} className="text-sm">
                            {item.name} (x{item.quantity}) - ₹{item.price}
                          </div>
                        ))}
                      </td>
                      <td className="p-4">₹{order.totalAmount}</td>
                      <td className="p-4">
                      <span
  className={`px-2 py-1 rounded text-sm ${
    order.status === "delivered"
      ? "bg-green-100 text-green-800"
      : order.status === "picked"
      ? "bg-blue-100 text-blue-800"
      : order.status === "assigned"
      ? "bg-yellow-100 text-yellow-800"
      : order.status === "undelivered"
      ? "bg-red-100 text-red-800"
      : "bg-gray-100 text-gray-800"
  }`}
>
  {order.status}
</span>

                        <div className="text-xs mt-1 text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4">
                        {order.status === "pending" ? (
                          <select
                            onChange={(e) =>
                              assignOrder(order._id, e.target.value)
                            }
                            className="p-2 border rounded w-full text-sm"
                            defaultValue=""
                          >
                            <option value="" disabled>
                              Assign Partner
                            </option>
                            {partners.map((partner) => (
                              <option
                                key={partner._id}
                                value={partner._id}
                                className={
                                  partner.status === "inactive"
                                    ? "text-red-500"
                                    : ""
                                }
                              >
                                {partner.name}{" "}
                                {partner.status === "inactive" && "(Inactive)"}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="flex gap-2">
                            {order.status === "assigned" && (
                              <button
                                onClick={() =>
                                  updateOrderStatus(order._id, "picked")
                                }
                                className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                              >
                                Mark as Picked
                              </button>
                            )}
                            {order.status === "picked" && (
                              <button
                                onClick={() =>
                                  updateOrderStatus(order._id, "delivered")
                                }
                                className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                              >
                                Mark as Delivered
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Partners Table */}
        <div className="bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 p-4">Partners List</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-4 text-left">Action</th>
                  <th className="p-4 text-left">Partner</th>
                  <th className="p-4 text-left">Contact</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Service Areas</th>
                  <th className="p-4 text-left">Completed Orders</th>
                  <th className="p-4 text-left">Cancelled Orders</th>
                  <th className="p-4 text-left">Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((partner) => {
                  // Fetch partner performance data safely
                  const stats = partnerMetrics[partner._id] ?? {
                    completedOrders: 0,
                    cancelledOrders: 0,
                    successRate: 0,
                  };

                  return (
                    <tr key={partner._id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        {partner.status === "active" && (
                          <button
                            onClick={() => handleNewOrder(partner)}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                          >
                            New Order
                          </button>
                        )}
                      </td>
                      <td className="p-4 font-medium">{partner.name}</td>
                      <td className="p-4">
                        <div className="text-sm">{partner.email}</div>
                        <div className="text-sm text-gray-600">
                          {partner.phone}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            partner.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {partner.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {(partner.areas || []).map((area, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">{stats.completedOrders}</td>
                      <td className="p-4">{stats.cancelledOrders}</td>
                      <td className="p-4">
                        {stats.completedOrders + stats.cancelledOrders > 0
                          ? (
                              (stats.completedOrders /
                                (stats.completedOrders +
                                  stats.cancelledOrders)) *
                              100
                            ).toFixed(2) + "%"
                          : "N/A"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Creation Modal */}
        {showOrderForm && selectedPartner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
              <h3 className="text-xl font-bold mb-4">
                Create Order for {selectedPartner.name}
              </h3>
              <form onSubmit={handleOrderSubmit}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1">Customer Name*</label>
                      <input
                        required
                        className="w-full p-2 border rounded"
                        value={orderFormData.customer.name}
                        onChange={(e) =>
                          setOrderFormData((prev) => ({
                            ...prev,
                            customer: {
                              ...prev.customer,
                              name: e.target.value,
                            },
                          }))
                        } // Added closing )) here
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Customer Phone*</label>
                      <input
                        required
                        className="w-full p-2 border rounded"
                        value={orderFormData.customer.phone}
                        onChange={(e) =>
                          setOrderFormData((prev) => ({
                            ...prev,
                            customer: {
                              ...prev.customer,
                              phone: e.target.value,
                            },
                          }))
                        } // Added closing )) here
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block mb-1">Customer Address*</label>
                      <input
                        required
                        className="w-full p-2 border rounded"
                        value={orderFormData.customer.address}
                        onChange={(e) =>
                          setOrderFormData((prev) => ({
                            ...prev,
                            customer: {
                              ...prev.customer,
                              address: e.target.value,
                            },
                          }))
                        } // Added closing )) here
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block mb-1">Order Items*</label>
                    {orderFormData.items.map((item, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input
                          required
                          placeholder="Item name"
                          className="flex-1 p-2 border rounded"
                          value={item.name}
                          onChange={(e) =>
                            setOrderFormData((prev) => ({
                              ...prev,
                              items: prev.items.map((itm, i) =>
                                i === index
                                  ? { ...itm, name: e.target.value }
                                  : itm
                              ),
                            }))
                          } // Added closing )) here
                        />
                        <p>Qty</p>
                        <input
                          required
                          type="number"
                          min="1"
                          placeholder="Qty"
                          className="w-20 p-2 border rounded"
                          value={item.quantity}
                          onChange={(e) =>
                            setOrderFormData((prev) => ({
                              ...prev,
                              items: prev.items.map((itm, i) =>
                                i === index
                                  ? { ...itm, quantity: +e.target.value }
                                  : itm
                              ),
                            }))
                          } // Added closing )) here
                        />
                        <p>Price</p>

                        <input
                          required
                          type="text"
                          placeholder="Price"
                          className="w-32 p-2 border rounded"
                          value={item.price}
                          onChange={(e) =>
                            setOrderFormData((prev) => ({
                              ...prev,
                              items: prev.items.map((itm, i) =>
                                i === index
                                  ? { ...itm, price: +e.target.value }
                                  : itm
                              ),
                            }))
                          } // Added closing )) here
                        />{" "}
                        {orderFormData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setOrderFormData((prev) => ({
                                ...prev,
                                items: prev.items.filter((_, i) => i !== index),
                              }))
                            } // Added closing )) here
                            className="text-red-500 px-2"
                          >
                            x
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setOrderFormData((prev) => ({
                          ...prev,
                          items: [
                            ...prev.items,
                            { name: "", quantity: 1, price: 0 },
                          ],
                        }))
                      } // Added closing )) here
                      className="text-blue-500 text-sm"
                    >
                      + Add Item
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1">Service Area*</label>
                      <select
                        required
                        className="w-full p-2 border rounded"
                        value={orderFormData.area}
                        onChange={(e) =>
                          setOrderFormData((prev) => ({
                            ...prev,
                            area: e.target.value,
                          }))
                        }
                      >
                        {selectedPartner?.areas.length ? (
                          selectedPartner.areas.map((area, index) => (
                            <option key={index} value={area}>
                              {area}
                            </option>
                          ))
                        ) : (
                          <option value="">No areas available</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1">Schedule Date/Time*</label>
                      <input
                        required
                        type="datetime-local"
                        className="w-full p-2 border rounded"
                        value={orderFormData.scheduledFor}
                        onChange={(e) =>
                          setOrderFormData((prev) => ({
                            ...prev,
                            scheduledFor: e.target.value,
                          }))
                        } // Added closing )) here
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowOrderForm(false)}
                      className="px-4 py-2 border rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Create Order
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
