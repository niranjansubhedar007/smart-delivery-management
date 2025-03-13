

// "use client";
// import { useEffect, useState } from "react";
// import Navbar from "../navbar/page";

// type Order = {
//   _id: string;
//   orderNumber: string;
//   assignedTo: string;
//   customer: { name: string; phone: string; address: string };
//   area: string;
//   totalAmount: number;
//   status: string;
//   scheduledFor: string;
// };

// type Assignment = {
//   orderId: string;
//   partnerId: string;
//   timestamp: string;
//   status: "success" | "failed";
//   reason?: string;
// };

// export default function AssignmentsPage() {
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
//   const [assignment, setAssignment] = useState<Assignment>({
//     orderId: "",
//     partnerId: "",
//     timestamp: new Date().toISOString(),
//     status: "success",
//     reason: "",
//   });

//   useEffect(() => {
//     const fetchAssignedOrders = async () => {
//       try {
//         const res = await fetch("/api/orders/assign");
//         const data = await res.json();
//         setOrders(data);
//       } catch (error) {
//         console.error("Error fetching assigned orders:", error);
//       }
//     };

//     fetchAssignedOrders();
//   }, []);

//   const handleView = (order: Order) => {
//     setSelectedOrder(order);
//     setAssignment({
//       orderId: order._id,
//       partnerId: order.assignedTo,
//       timestamp: new Date().toISOString(),
//       status: "success",
//       reason: "",
//     });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       const res = await fetch("/api/assignments/run", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(assignment),
//       });

//       if (!res.ok) throw new Error("Failed to update assignment");

//       alert("Assignment updated successfully!");

//       setOrders((prevOrders) =>
//         prevOrders.filter((order) => order.assignedTo !== assignment.partnerId)
//       );

//       setSelectedOrder(null);
//     } catch (error) {
//       console.error("Error updating assignment:", error);
//     }
//   };

//   return (
//     <>
//       <Navbar />
//       <div className="p-8 max-w-7xl mx-auto mt-20">
    

//         {/* Orders List */}
//         <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
//           <h2 className="text-2xl font-semibold text-gray-700 mb-4">
//             Active Assignments
//           </h2>
//           {orders.length > 0 ? (
//             <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {orders.map((order) => (
//                 <li
//                   key={order._id}
//                   className="bg-gray-50 p-6 rounded-lg shadow-md border hover:shadow-lg transition-all"
//                 >
//                   <p className="text-lg font-medium text-gray-800">
//                     Order No: <span className="font-bold">{order.orderNumber}</span>
//                   </p>
//                   <p className="text-gray-600">
//                     <strong>Customer:</strong> {order.customer.name} ({order.customer.phone})
//                   </p>
//                   <p className="text-gray-600">
//                     <strong>Scheduled For:</strong> {order.scheduledFor}
//                   </p>
//                   <p className="text-gray-600">
//                     <strong>Status:</strong>{" "}
//                     <span
//                       className={`px-2 py-1 rounded text-sm font-semibold ${
//                         order.status === "delivered"
//                           ? "bg-green-200 text-green-800"
//                           : order.status === "picked"
//                           ? "bg-blue-200 text-blue-800"
//                           : order.status === "assigned"
//                           ? "bg-yellow-200 text-yellow-800"
//                           : "bg-gray-200 text-gray-800"
//                       }`}
//                     >
//                       {order.status}
//                     </span>
//                   </p>
//                   <button
//                     onClick={() => handleView(order)}
//                     className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
//                   >
//                     View Details
//                   </button>
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p className="text-gray-600 text-center">No assigned orders found.</p>
//           )}
//         </div>

//         {/* Modal for Updating Assignment */}
//         {selectedOrder && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
//             <div className="bg-white p-8 rounded-lg w-full max-w-md shadow-lg">
//               <h2 className="text-2xl font-bold mb-4 text-gray-800">
//                 Update Assignment
//               </h2>
//               <form onSubmit={handleSubmit}>
//                 <label className="block text-gray-700 font-medium mb-2">
//                   Timestamp:
//                 </label>
//                 <input
//                   type="datetime-local"
//                   value={new Date(assignment.timestamp).toISOString().slice(0, 16)}
//                   onChange={(e) =>
//                     setAssignment({ ...assignment, timestamp: new Date(e.target.value).toISOString() })
//                   }
//                   className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400 mb-4"
//                 />

//                 <label className="block text-gray-700 font-medium mb-2">
//                   Status:
//                 </label>
//                 <select
//                   value={assignment.status}
//                   onChange={(e) =>
//                     setAssignment({ ...assignment, status: e.target.value as "success" | "failed" })
//                   }
//                   className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400 mb-4"
//                 >
//                   <option value="success">Success</option>
//                   <option value="failed">Failed</option>
//                 </select>

//                 <label className="block text-gray-700 font-medium mb-2">
//                   Reason (if failed):
//                 </label>
//                 <input
//                   type="text"
//                   value={assignment.reason}
//                   onChange={(e) => setAssignment({ ...assignment, reason: e.target.value })}
//                   className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400 mb-4"
//                   disabled={assignment.status === "success"}
//                 />

//                 <div className="flex justify-between mt-4">
//                   <button
//                     type="submit"
//                     className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
//                   >
//                     Save
//                   </button>
//                   <button
//                     onClick={() => setSelectedOrder(null)}
//                     className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
//                   >
//                     Close
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   );
// }


"use client";
import { useEffect, useState } from "react";
import Navbar from "../navbar/page";

type Order = {
  _id: string;
  orderNumber: string;
  assignedTo: string;
  customer: { name: string; phone: string; address: string };
  area: string;
  totalAmount: number;
  status: string;
  scheduledFor: string;
};

type Assignment = {
  orderId: string;
  partnerId: string;
  timestamp: string;
  status: "success" | "failed";
  reason?: string;
};

export default function AssignmentsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [assignment, setAssignment] = useState<Assignment>({
    orderId: "",
    partnerId: "",
    timestamp: new Date().toISOString(),
    status: "success",
    reason: "",
  });

  useEffect(() => {
    const fetchAssignedOrders = async () => {
      try {
        const res = await fetch("/api/orders/assign");
        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching assigned orders:", error);
      }
    };

    fetchAssignedOrders();
  }, []);

  const handleView = (order: Order) => {
    setSelectedOrder(order);
    setAssignment({
      orderId: order._id,
      partnerId: order.assignedTo,
      timestamp: new Date().toISOString(),
      status: "success",
      reason: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Step 1: Update Assignment Status
      const res = await fetch("/api/assignments/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignment),
      });

      if (!res.ok) throw new Error("Failed to update assignment");

      // Step 2: If status is "failed", update the order status to "undelivered"
      if (assignment.status === "failed") {
        const updateRes = await fetch(`/api/orders/${assignment.orderId}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "undelivered" }),
        });

        if (!updateRes.ok) throw new Error("Failed to update order status");
      }

      alert("Assignment updated successfully!");

      // Remove updated order from list and close modal
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === assignment.orderId
            ? { ...order, status: assignment.status === "failed" ? "undelivered" : order.status }
            : order
        )
      );

      setSelectedOrder(null);
    } catch (error) {
      console.error("Error updating assignment:", error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="p-8 max-w-7xl mx-auto mt-20">
        {/* Orders List */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Active Assignments
          </h2>
          {orders.length > 0 ? (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map((order) => (
                <li
                  key={order._id}
                  className="bg-gray-50 p-6 rounded-lg shadow-md border hover:shadow-lg transition-all"
                >
                  <p className="text-lg font-medium text-gray-800">
                    Order No: <span className="font-bold">{order.orderNumber}</span>
                  </p>
                  <p className="text-gray-600">
                    <strong>Customer:</strong> {order.customer.name} ({order.customer.phone})
                  </p>
                  <p className="text-gray-600">
                    <strong>Scheduled For:</strong> {order.scheduledFor}
                  </p>
                  <p className="text-gray-600">
                    <strong>Status:</strong>{" "}
                    <span
                      className={`px-2 py-1 rounded text-sm font-semibold ${
                        order.status === "delivered"
                          ? "bg-green-200 text-green-800"
                          : order.status === "picked"
                          ? "bg-blue-200 text-blue-800"
                          : order.status === "assigned"
                          ? "bg-yellow-200 text-yellow-800"
                          : order.status === "undelivered"
                          ? "bg-red-200 text-red-800"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </p>
                  <button
                    onClick={() => handleView(order)}
                    className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                  >
                    View Details
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 text-center">No assigned orders found.</p>
          )}
        </div>

        {/* Modal for Updating Assignment */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg w-full max-w-md shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                Update Assignment
              </h2>
              <form onSubmit={handleSubmit}>
                <label className="block text-gray-700 font-medium mb-2">
                  Timestamp:
                </label>
                <input
                  type="datetime-local"
                  value={new Date(assignment.timestamp).toISOString().slice(0, 16)}
                  onChange={(e) =>
                    setAssignment({ ...assignment, timestamp: new Date(e.target.value).toISOString() })
                  }
                  className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400 mb-4"
                />

                <label className="block text-gray-700 font-medium mb-2">
                  Status:
                </label>
                <select
                  value={assignment.status}
                  onChange={(e) =>
                    setAssignment({ ...assignment, status: e.target.value as "success" | "failed" })
                  }
                  className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400 mb-4"
                >
                  <option value="success">Success</option>
                  <option value="failed">Failed</option>
                </select>

                <label className="block text-gray-700 font-medium mb-2">
                  Reason (if failed):
                </label>
                <input
                  type="text"
                  value={assignment.reason}
                  onChange={(e) => setAssignment({ ...assignment, reason: e.target.value })}
                  className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400 mb-4"
                  disabled={assignment.status === "success"}
                />

                <div className="flex justify-between mt-4">
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                  >
                    Close
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
