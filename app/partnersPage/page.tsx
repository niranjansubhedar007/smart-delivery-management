"use client";
import { useState, useEffect } from "react";
import Navbar from "../navbar/page";

interface Partner {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  areas: string[];
  shift: {
    start: string;
    end: string;
  };
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    areas: "",
    shiftStart: "",
    shiftEnd: "",
    status: "active", // ✅ Default to "active"
  });

  useEffect(() => {
    fetch("/api/partners")
      .then((res) => res.json())
      .then((data) => {
        setPartners(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const partnerData = {
      ...form,
      areas: form.areas ? form.areas.split(",") : [],
      shift: { start: form.shiftStart, end: form.shiftEnd },
      status: form.status === "inactive" ? "inactive" : "active",
    };
  
    const method = editingPartner ? "PUT" : "POST";
    const endpoint = editingPartner
      ? `/api/partners/${editingPartner._id}`
      : "/api/partners";
  
    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partnerData),
    });
  
    if (res.ok) {
      alert(editingPartner ? "Partner updated successfully!" : "Partner added successfully!");
  
      setForm({
        name: "",
        email: "",
        phone: "",
        areas: "",
        shiftStart: "",
        shiftEnd: "",
        status: "active",
      });
      setEditingPartner(null);
  
      fetch("/api/partners")
        .then((res) => res.json())
        .then((data) => setPartners(data));
    } else {
      alert("Something went wrong. Please try again.");
    }
  };
  
  const handleEdit = (partner: Partner) => {
    alert("Editing partner: " + partner.name);
  
    setEditingPartner(partner);
    setForm({
      name: partner.name || "", 
      email: partner.email || "",
      phone: partner.phone || "",
      areas: Array.isArray(partner.areas) ? partner.areas.join(",") : "",
      shiftStart: partner.shift?.start ?? "",
      shiftEnd: partner.shift?.end ?? "",
      status: partner.status || "active",
    });
  };
  

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this partner?")) return;
  
    const res = await fetch(`/api/partners/${id}`, {
      method: "DELETE",
    });
  
    if (res.ok) {
      alert("Partner deleted successfully!");
      setPartners(partners.filter((partner) => partner._id !== id));
    } else {
      alert("Failed to delete partner. Please try again.");
    }
  };
  

  return (
    <>
      <Navbar />
      <div className=" max-w-5xl mx-auto bg-white shadow-lg rounded-lg mt-17">
 

  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ">
    {/* Add/Edit Partner Form */}
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
        {editingPartner ? "Edit Partner" : "Add New Partner"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Partner Name"
          onChange={handleChange}
          value={form.name}
          required
          className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          value={form.email}
          required
          className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          onChange={handleChange}
          value={form.phone}
          required
          className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="text"
          name="areas"
          placeholder="Assigned Areas (comma-separated)"
          onChange={handleChange}
          value={form.areas}
          required
          className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400"
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Shift Start</label>
            <input
              type="time"
              name="shiftStart"
              onChange={handleChange}
              value={form.shiftStart}
              required
              className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Shift End</label>
            <input
              type="time"
              name="shiftEnd"
              onChange={handleChange}
              value={form.shiftEnd}
              required
              className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          required
          className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
        >
          {editingPartner ? "Update Partner" : "Create Partner"}
        </button>
      </form>
    </div>

    {/* Partners List */}
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
        Existing Partners
      </h2>
      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {partners.map((partner) => (
            <li
              key={partner._id}
              className="flex justify-between items-center p-4 bg-white shadow-md rounded-lg transition hover:scale-105"
            >
              <div>
                <p className="text-lg font-medium text-gray-800">{partner.name}</p>
                <p className="text-sm text-gray-500">{partner.email}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(partner)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-600 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(partner._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
</div>

    </>
  );
}
