"use client";
import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-blue-600 p-4 shadow-md fixed top-0 w-full">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Logo */}
        <Link href="/" className="text-white text-xl font-bold">
          Smart Delivery Management
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6">
          <Link href="/" className="text-white hover:text-gray-300">
            Home
          </Link>
          <Link href="/partnersPage" className="text-white hover:text-gray-300">
            Partner
          </Link>
          <Link href="/orders" className="text-white hover:text-gray-300">
            Order
          </Link>
          <Link href="/assignments" className="text-white hover:text-gray-300">
            Assignment 
          </Link>
          <Link href="/assignmentMetrics" className="text-white hover:text-gray-300">
            Assignment Metrics
          </Link>
        
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden flex flex-col mt-2 space-y-2 bg-blue-700 p-3 rounded-lg">
       <Link href="/" className="text-white hover:text-gray-300">
            Home
          </Link>
          <Link href="/partnersPage" className="text-white hover:text-gray-300">
            Partner
          </Link>
          <Link href="/orders" className="text-white hover:text-gray-300">
            Order
          </Link>
          <Link href="/assignments" className="text-white hover:text-gray-300">
            Assignment 
          </Link>
          <Link href="/assignmentMetrics" className="text-white hover:text-gray-300">
            Assignment Metrics
          </Link>
        </div>
      )}
    </nav>
  );
}
