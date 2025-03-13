// "use client";
// import { useEffect, useState } from "react";
// import Navbar from "../navbar/page";

// type Assignment = {
//   _id: string;
//   orderId: {
//     orderNumber: string;
//     customer: { name: string; phone: string; address: string };
//     area: string;
//     totalAmount: number;
//     status: string;
//   };
//   status: "success" | "failed";
//   timestamp: string;
//   reason?: string;
// };

// type AssignmentMetrics = {
//   totalAssigned: number;
//   successRate: number;
//   assignments: Assignment[]; // Store all assignments
//   partnerMetrics?: Record<string, { completedOrders: number; cancelledOrders: number }>; // Optional
// };

// type Partner = {
//   _id: string;
//   name: string;
// };

// export default function AssignmentsMetricsPage() {
//   const [partners, setPartners] = useState<Partner[]>([]);
//   const [selectedPartner, setSelectedPartner] = useState<string>("");
//   const [metrics, setMetrics] = useState<AssignmentMetrics | null>(null);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     // Fetch partners list
//     const fetchPartners = async () => {
//       try {
//         const res = await fetch("/api/partners");
//         if (!res.ok) throw new Error("Failed to fetch partners");
//         const data = await res.json();
//         setPartners(data);
//       } catch (error) {
//         console.error("Error fetching partners:", error);
//       }
//     };

//     fetchPartners();
//   }, []);

//   useEffect(() => {
//     const fetchMetrics = async () => {
//       setLoading(true);
//       try {
//         const url = selectedPartner
//           ? `/api/assignments/metrics?partnerId=${selectedPartner}`
//           : "/api/assignments/metrics";
//         const res = await fetch(url);
//         if (!res.ok) throw new Error("Failed to fetch assignment metrics");
//         const data = await res.json();
//         setMetrics(data);
//         console.log("Fetched Metrics:", data);
//       } catch (error) {
//         console.error("Error fetching assignment metrics:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMetrics();
//   }, [selectedPartner]);

//   return (
//     <>
//       <Navbar />
//       <div className="p-6 mt-13">
//         <h1 className="text-2xl font-bold mb-4">Assignment Metrics</h1>

//         {/* Partner Selection Dropdown */}
//         <label className="block mb-4">
//           <span className="font-bold">Select Partner:</span>
//           <select
//             value={selectedPartner}
//             onChange={(e) => setSelectedPartner(e.target.value)}
//             className="border p-2 w-full"
//           >
//             <option value="">All Partners</option>
//             {partners.length > 0 &&
//               partners.map((partner) => (
//                 <option key={partner._id} value={partner._id}>
//                   {partner.name}
//                 </option>
//               ))}
//           </select>
//         </label>

//         {loading ? (
//           <p>Loading metrics...</p>
//         ) : metrics ? (
//           <div className="border p-4 rounded shadow">
//             <p className="text-lg">
//               <strong>Total Assignments:</strong> {metrics.totalAssigned}
//             </p>
//             <p className="text-lg">
//               <strong>Success Rate:</strong> {metrics.successRate ? metrics.successRate.toFixed(2) + "%" : "N/A"}
//             </p>

//             {/* Partner Statistics */}
//             {metrics?.partnerMetrics && selectedPartner && (
//               <div className="border p-4 rounded shadow mt-4">
//                 <h2 className="text-xl font-bold">Partner Statistics</h2>
//                 {partners
//                   .filter((partner) => partner._id === selectedPartner)
//                   .map((partner) => {
//                     const stats = metrics?.partnerMetrics?.[partner._id] ?? {
//                       completedOrders: 0,
//                       cancelledOrders: 0,
//                     };
//                     return (
//                       <div key={partner._id} className="border p-3 rounded shadow mt-2">
//                         <p>
//                           <strong>{partner.name}</strong>
//                         </p>
//                         <p>✅ Completed Orders: {stats.completedOrders}</p>
//                         <p>❌ Cancelled Orders: {stats.cancelledOrders}</p>
//                       </div>
//                     );
//                   })}
//               </div>
//             )}

//             {/* All Assignments List */}
//             <h2 className="text-xl font-bold mt-4">Assignments</h2>
//             {metrics.assignments.length > 0 ? (
//               <ul className="list-disc pl-5">
//                 {metrics.assignments.map((assignment) => (
//                   <li key={assignment._id} className="border p-4 mb-2 rounded shadow">
//                     <p>
//                       <strong>Order No:</strong> {assignment.orderId.orderNumber}
//                     </p>
//                     <p>
//                       <strong>Customer:</strong> {assignment.orderId.customer.name} ({assignment.orderId.customer.phone})
//                     </p>
//                     <p>
//                       <strong>Area:</strong> {assignment.orderId.area}
//                     </p>
//                     <p>
//                       <strong>Total Amount:</strong> ₹{assignment.orderId.totalAmount}
//                     </p>
//                     <p>
//                       <strong>Status:</strong> {assignment.status}
//                     </p>
//                     <p>
//                       <strong>Timestamp:</strong> {new Date(assignment.timestamp).toLocaleString()}
//                     </p>
//                     {assignment.reason && (
//                       <p>
//                         <strong>Reason:</strong> {assignment.reason}
//                       </p>
//                     )}
//                   </li>
//                 ))}
//               </ul>
//             ) : (
//               <p>No assignments found.</p>
//             )}
//           </div>
//         ) : (
//           <p>No data available.</p>
//         )}
//       </div>
//     </>
//   );
// }




"use client";
import { useEffect, useState } from "react";
import Navbar from "../navbar/page";

type Assignment = {
  _id: string;
  orderId: {
    orderNumber: string;
    customer: { name: string; phone: string; address: string };
    area: string;
    totalAmount: number;
    status: string;
  };
  status: "success" | "failed";
  timestamp: string;
  reason?: string;
};

type AssignmentMetrics = {
  totalAssigned: number;
  successRate: number;
  assignments: Assignment[];
  partnerMetrics?: Record<string, { completedOrders: number; cancelledOrders: number }>;
};

type Partner = {
  _id: string;
  name: string;
};

export default function AssignmentsMetricsPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<string>("");
  const [metrics, setMetrics] = useState<AssignmentMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const res = await fetch("/api/partners");
        if (!res.ok) throw new Error("Failed to fetch partners");
        const data = await res.json();
        setPartners(data);
      } catch (error) {
        console.error("Error fetching partners:", error);
      }
    };

    fetchPartners();
  }, []);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const url = selectedPartner
          ? `/api/assignments/metrics?partnerId=${selectedPartner}`
          : "/api/assignments/metrics";
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch assignment metrics");
        const data = await res.json();
        setMetrics(data);
      } catch (error) {
        console.error("Error fetching assignment metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [selectedPartner]);

  return (
    <>
      <Navbar />
      <div className="p-8 max-w-7xl mx-auto mt-20">
      
        {/* Partner Selection Dropdown */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 mb-8">
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            Select Partner:
          </label>
          <select
            value={selectedPartner}
            onChange={(e) => setSelectedPartner(e.target.value)}
            className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400"
          >
            <option value="">All Partners</option>
            {partners.map((partner) => (
              <option key={partner._id} value={partner._id}>
                {partner.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-center text-gray-600">Loading metrics...</p>
        ) : metrics ? (
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            {/* Overall Metrics */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Overall Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-100 p-6 rounded-lg shadow-md">
                <p className="text-lg font-medium text-gray-700">
                  <strong>Total Assignments:</strong> {metrics.totalAssigned}
                </p>
              </div>
              <div className="bg-gray-100 p-6 rounded-lg shadow-md">
                <p className="text-lg font-medium text-gray-700">
                  <strong>Success Rate:</strong>{" "}
                  {metrics.successRate ? metrics.successRate.toFixed(2) + "%" : "N/A"}
                </p>
              </div>
            </div>

            {/* Partner Statistics */}
            {metrics?.partnerMetrics && selectedPartner && (
              <div className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-300 mt-6">
                <h2 className="text-xl font-semibold mb-4">Partner Statistics</h2>
                {partners
                  .filter((partner) => partner._id === selectedPartner)
                  .map((partner) => {
                    const stats = metrics.partnerMetrics?.[partner._id] ?? {
                      completedOrders: 0,
                      cancelledOrders: 0,
                    };
                    return (
                      <div
                        key={partner._id}
                        className="bg-white p-4 rounded-lg shadow-md border mt-4"
                      >
                        <p className="text-lg font-medium">{partner.name}</p>
                        <p className="text-gray-600">✅ Completed Orders: {stats.completedOrders}</p>
                        <p className="text-gray-600">❌ Cancelled Orders: {stats.cancelledOrders}</p>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Assignments List */}
            <h2 className="text-xl font-semibold text-gray-800 mt-8">Assignments</h2>
            {metrics.assignments.length > 0 ? (
              <div className="mt-4">
                {metrics.assignments.map((assignment) => (
                  <div key={assignment._id} className="bg-gray-50 p-6 rounded-lg shadow-md border mb-4">
                    <p className="text-lg font-medium">
                      <strong>Order No:</strong> {assignment.orderId.orderNumber}
                    </p>
                    <p className="text-gray-600">
                      <strong>Customer:</strong> {assignment.orderId.customer.name} ({assignment.orderId.customer.phone})
                    </p>
                    <p className="text-gray-600">
                      <strong>Area:</strong> {assignment.orderId.area}
                    </p>
                    <p className="text-gray-600">
                      <strong>Total Amount:</strong> ₹{assignment.orderId.totalAmount}
                    </p>
                    <p className="text-gray-600">
                      <strong>Status:</strong>{" "}
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          assignment.status === "success"
                            ? "bg-green-200 text-green-800"
                            : "bg-red-200 text-red-800"
                        }`}
                      >
                        {assignment.status}
                      </span>
                    </p>
                    <p className="text-gray-600">
                      <strong>Timestamp:</strong> {new Date(assignment.timestamp).toLocaleString()}
                    </p>
                    {assignment.reason && (
                      <p className="text-gray-600">
                        <strong>Reason:</strong> {assignment.reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center mt-4">No assignments found.</p>
            )}
          </div>
        ) : (
          <p className="text-gray-600 text-center">No data available.</p>
        )}
      </div>
    </>
  );
}
