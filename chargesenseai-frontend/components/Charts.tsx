import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface CustomerSegment {
  segment: string;
  totalCharge: number;
  bookingCount: number;
}

interface WeeklyCharge {
  day: string;
  totalCharge: number;
  predictedCharge: number;
}

interface ChargeDistribution {
  range: string;
  count: number;
}

interface BusUsageItem {
  busService: string; // Full label: "Mon AM"
  usage: number;
}

interface ChartsProps {
  customerSegments: CustomerSegment[];
  weeklyCharges: WeeklyCharge[];
  chargeDistribution: ChargeDistribution[];
  busUsage: BusUsageItem[];
}

const Charts: React.FC<ChartsProps> = ({
  customerSegments,
  weeklyCharges,
  chargeDistribution,
  busUsage,
}) => {
  const textStyle = { fill: "#000", fontSize: 12 };

  // ---------------- Bus Usage Chart Data ----------------
  const busUsageChartData = busUsage.map((item) => ({
    label: item.busService,
    usage: item.usage,
  }));

  return (
    <div className="space-y-12">
      {/* Raw bus usage JSON for debug */}
      <div>
        <h3 className="font-semibold mb-2 text-gray-900">Bus Usage Raw Data</h3>
        <pre>{JSON.stringify(busUsage, null, 2)}</pre>
      </div>

      {/* Bus Usage Chart */}
      <div>
        <h3 className="font-semibold mb-2 text-gray-900">Bus Usage</h3>
        {busUsageChartData.length ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={busUsageChartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tick={textStyle}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis allowDecimals={false} tick={textStyle} />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", color: "#000" }}
                formatter={(value: any) => [value, "Bookings"]}
              />
              <Legend />
              <Bar dataKey="usage" name="Bookings" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-700">No bus usage data available.</p>
        )}
      </div>
    </div>
  );
};

export default Charts;
