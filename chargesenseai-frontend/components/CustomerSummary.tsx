interface Customer {
  segment: string;
  classification: string;
  predicted: string;
  totalCharge: number;
  bookingCount: number;
}

interface CustomerSummaryProps {
  customers: Customer[];
}

export default function CustomerSummary({ customers }: CustomerSummaryProps) {
  return (
    <div className="overflow-x-auto mt-6">
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">Customer</th>
            <th className="border p-2 text-left">Classification</th>
            <th className="border p-2 text-left">Predicted</th>
            <th className="border p-2 text-left">Total Charge</th>
            <th className="border p-2 text-left">Booking Count</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.segment}>
              <td className="border p-2">{c.segment}</td>
              <td className="border p-2">{c.classification || "N/A"}</td>
              <td className="border p-2">{c.predicted || "N/A"}</td>
              <td className="border p-2">£{c.totalCharge.toFixed(2)}</td>
              <td className="border p-2">{c.bookingCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
