"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import Toast from "./Toast";

interface Customer {
  segment: string;
  classification: string;
  predicted: string;
  totalCharge: number;
  bookingCount: number;
  notes?: string;
}

interface BusUsage {
  busService: string;
  usage: number;
}

interface UploadFormProps {
  onDataReady?: (
    customerSegments: Customer[],
    weeklyCharges: { day: string; actual: number; predicted: number }[],
    busUsage: BusUsage[]
  ) => void;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const SESSIONS = ["AM", "Explorers 1", "Explorers 2", "Explorers 3"];

export default function UploadForm({ onDataReady }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const parseExcel = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);

    const allCustomers: Customer[] = [];
    const busUsageTemp: BusUsage[] = [];

    DAYS.forEach((day) => {
      const sheet = workbook.Sheets[day];
      if (!sheet) return;
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      rows.forEach((row: any) => {
        const forename = (row["Forename"] || "").toString().trim();
        const surname = (row["Surname"] || "").toString().trim();
        const name = `${forename} ${surname}`;
        const chargeStr = row["Charge"]?.toString().replace(/[^0-9.]/g, "") || "0";
        const totalCharge = parseFloat(chargeStr);
        const bookingCount = SESSIONS.reduce(
          (sum, s) => sum + Number(row[s] || 0),
          0
        );

        allCustomers.push({
          segment: name,
          classification: row["Booking Type"] || "Standard",
          predicted: "N/A", // Placeholder for future AI
          totalCharge,
          bookingCount,
          notes: row["Notes"] || "",
        });

        // Aggregate bus usage
        SESSIONS.forEach((s) => {
          const serviceName = `${day} ${s}`;
          const usage = Number(row[s] || 0);
          const existing = busUsageTemp.find((b) => b.busService === serviceName);
          if (existing) {
            existing.usage += usage;
          } else {
            busUsageTemp.push({ busService: serviceName, usage });
          }
        });
      });
    });

    // Aggregate weekly charges per day
    const weeklyCharges = DAYS.map((day) => {
      const sheet = workbook.Sheets[day];
      if (!sheet) return { day, actual: 0, predicted: 0 };
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      const actual = rows.reduce((sum, row: any) => {
        const chargeStr = row["Charge"]?.toString().replace(/[^0-9.]/g, "") || "0";
        return sum + parseFloat(chargeStr);
      }, 0);
      return { day, actual, predicted: 0 }; // predicted placeholder
    });

    return { customerSegments: allCustomers, weeklyCharges, busUsage: busUsageTemp };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setToastMessage("Please select a file to upload.");
      return;
    }

    setLoading(true);
    setToastMessage("");

    try {
      const { customerSegments, weeklyCharges, busUsage } = await parseExcel(file);

      if (onDataReady) {
        onDataReady(customerSegments, weeklyCharges, busUsage);
      }

      setToastMessage("Upload and parsing successful!");
    } catch (err: any) {
      console.error(err);
      setToastMessage(`Error reading file: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4 mb-6">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-4 items-center"
      >
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="border p-2 rounded w-full sm:w-auto text-gray-800 placeholder:text-gray-700"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition w-full sm:w-auto flex justify-center items-center gap-2"
        >
          {loading && (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />npm run dev
            </svg>
          )}
          {loading ? "Parsing..." : "Upload"}
        </button>
      </form>

      {toastMessage && <Toast message={toastMessage} />}
    </div>
  );
}
