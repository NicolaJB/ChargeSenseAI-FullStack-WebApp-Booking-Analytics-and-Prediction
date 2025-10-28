"use client";

import Charts from "./Charts";

interface CustomerSegment {
  Segment: number;
  TotalCharge: number;
  BookingCount: number;
}

interface WeeklyCharge {
  Day: string;
  TotalCharge: number;
  PredictedCharge: number;
}

interface Props {
  customerSegments: CustomerSegment[];
  weeklyCharges: WeeklyCharge[];
}

export default function SegmentationResults({ customerSegments, weeklyCharges }: Props) {
  const totalCustomers = customerSegments.length;
  const totalCharges = customerSegments.reduce((sum, c) => sum + c.TotalCharge, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h3 className="font-semibold">Total Customers</h3>
          <p className="text-2xl">{totalCustomers}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h3 className="font-semibold">Total Charges (£)</h3>
          <p className="text-2xl">{totalCharges}</p>
        </div>
      </div>

      {/* Charts */}
      <Charts customerSegments={customerSegments} weeklyCharges={weeklyCharges} />
    </div>
  );
}
