"use client";

import { useState } from "react";
import UploadForm from "../components/UploadForm";
import Dashboard from "../components/Dashboard";

export default function HomePage() {
  const [customerSegments, setCustomerSegments] = useState<any[]>([]);
  const [weeklyCharges, setWeeklyCharges] = useState<any[]>([]);
  const [busUsage, setBusUsage] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleDataReady = (segments: any[], weekly: any[], bus: any[]) => {
    setLoading(true);

    const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const SESSIONS = ["AM", "Explorers 1", "Explorers 2", "Explorers 3"];

    // Normalize bus usage
    const normalizedBus: { busService: string; usage: number }[] = [];
    DAYS.forEach((day) => {
      SESSIONS.forEach((session) => {
        const serviceName = `${day} ${session}`;
        const found = bus.find((b) => b.busService === serviceName);
        normalizedBus.push({
          busService: serviceName,
          usage: found?.usage || 0,
        });
      });
    });

    // Calculate total charges per day
    const dayMap: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4 };
    const dailyTotals: { day: string; actual: number; index: number }[] = DAYS.map((day) => {
      const total = weekly
        .filter((w) => w.day === day)
        .reduce((sum, w) => sum + (w.actual ?? 0), 0);
      return { day, actual: total, index: dayMap[day] };
    });

    // Simple linear regression to predict charges per day
    const n = dailyTotals.length;
    const sumX = dailyTotals.reduce((sum, d) => sum + d.index, 0);
    const sumY = dailyTotals.reduce((sum, d) => sum + d.actual, 0);
    const sumXY = dailyTotals.reduce((sum, d) => sum + d.index * d.actual, 0);
    const sumXX = dailyTotals.reduce((sum, d) => sum + d.index * d.index, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const weeklyWithPredicted = dailyTotals.map((d) => ({
      day: d.day,
      actual: d.actual,
      predicted: parseFloat((slope * d.index + intercept).toFixed(2)),
    }));

    // Calculate predicted charge for each student based on linear regression
    const studentData = segments.map((c) => ({
      ...c,
      predicted: parseFloat(
        ((slope / n) * c.bookingCount + intercept / n).toFixed(2) // simple linear scaling
      ),
    }));

    // Update state
    setCustomerSegments(studentData || []);
    setWeeklyCharges(weeklyWithPredicted || []);
    setBusUsage(normalizedBus || []);
    setLoading(false);
  };

  return (
    <div className="bg-white min-h-screen p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        ChargeSense AI: School Booking Weekly Insights Generator
      </h1>

      {/* Upload Form */}
      <UploadForm onDataReady={handleDataReady} />

      {/* Dashboard */}
      <Dashboard
        customerSegments={customerSegments || []}
        weeklyCharges={weeklyCharges || []}
        busUsage={busUsage || []}
        loading={loading}
      />
    </div>
  );
}
