"use client";

import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Customer {
  segment: string;
  classification?: string;
  predicted?: string;
  totalCharge: number;
  bookingCount: number;
}

interface WeeklyCharge {
  day: string;
  actual: number;
  predicted?: number;
}

interface BusUsage {
  busService: string;
  usage: number;
}

interface DashboardProps {
  customerSegments: Customer[];
  weeklyCharges: WeeklyCharge[];
  busUsage: BusUsage[];
  loading: boolean;
}

export default function Dashboard({
  customerSegments = [],
  weeklyCharges = [],
  busUsage = [],
  loading,
}: DashboardProps) {
  if (loading) return <p className="text-gray-900">Loading data...</p>;

  const topCustomers = (customerSegments || []).slice(0, 5);

  return (
    <div className="mt-6 space-y-8 text-gray-900">
      {/* Top 5 Students Table */}
      {topCustomers.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2 text-gray-900">Top 5 Student Spenders</h2>
          <p className="mb-2 text-gray-700 text-sm">This table shows the top 5 students based on total charges. The "Predicted" column estimates future charges using a simple linear regression based on the number of bookings.
          </p>
          <div className="overflow-x-auto">
            <table className="table-auto border-collapse border border-gray-800 w-full text-left text-gray-900">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="border border-gray-800 px-2 py-1">Customer</th>
                  <th className="border border-gray-800 px-2 py-1">Classification</th>
                  <th className="border border-gray-800 px-2 py-1">Predicted</th>
                  <th className="border border-gray-800 px-2 py-1">Total Charge</th>
                  <th className="border border-gray-800 px-2 py-1">Booking Count</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((c) => (
                  <tr key={c.segment} className="even:bg-gray-100 odd:bg-gray-50">
                    <td className="border border-gray-800 px-2 py-1">{c.segment}</td>
                    <td className="border border-gray-800 px-2 py-1">{c.classification || "N/A"}</td>
                    <td className="border border-gray-800 px-2 py-1">{c.predicted || "N/A"}</td>
                    <td className="border border-gray-800 px-2 py-1">£{c.totalCharge.toFixed(2)}</td>
                    <td className="border border-gray-800 px-2 py-1">{c.bookingCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Weekly Charges Chart */}
      {weeklyCharges.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2 text-gray-900">Weekly Charges</h2>
          <p className="mb-2 text-gray-700 text-sm">This chart compares the actual total charges per day (blue) with predicted charges (green) calculated using a linear regression across the week.
          </p>
          <Bar
            data={{
              labels: weeklyCharges.map((d) => d.day),
              datasets: [
                {
                  label: "Actual Charge",
                  data: weeklyCharges.map((d) => d.actual || 0),
                  backgroundColor: "rgba(59, 130, 246, 0.7)",
                },
                {
                  label: "Predicted Charge",
                  data: weeklyCharges.map((d) => d.predicted || 0),
                  backgroundColor: "rgba(34, 197, 94, 0.7)",
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { labels: { color: "#111827" } },
                tooltip: { enabled: true, backgroundColor: "#111827", titleColor: "#fff", bodyColor: "#fff" },
              },
              scales: { x: { ticks: { color: "#111827" } }, y: { ticks: { color: "#111827" } } },
            }}
          />
        </div>
      )}

      {/* Bus Usage Chart */}
      {busUsage.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2 text-gray-900">Bus Usage</h2>
          <p className="mb-2 text-gray-700 text-sm">This chart shows the number of bookings for each bus service throughout the week.
          </p>
          <Bar
            data={{
              labels: busUsage.map((b) => b.busService),
              datasets: [
                {
                  label: "Bookings",
                  data: busUsage.map((b) => b.usage || 0),
                  backgroundColor: "rgba(245, 158, 11, 0.7)",
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { labels: { color: "#111827" } },
                tooltip: { enabled: true, backgroundColor: "#111827", titleColor: "#fff", bodyColor: "#fff" },
              },
              scales: { x: { ticks: { color: "#111827", maxRotation: 90, minRotation: 45 } }, y: { ticks: { color: "#111827" } } },
            }}
          />
        </div>
      )}
    </div>
  );
}
