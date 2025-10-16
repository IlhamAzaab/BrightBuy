import React, { useEffect, useState } from "react";
import axios from "axios";

const QuarterlyReport = () => {
  const [reportData, setReportData] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `http://localhost:9000/api/quartreport/quarterly?year=${year}`
        );
        setReportData(data);
        setError("");
      } catch (err) {
        setError("Failed to fetch quarterly report");
        setReportData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [year]);

  const formatCurrency = (value) => {
    return value ? Number(value).toFixed(2) : "0.00";
  };

  const Months = {
    1: "Jan-Mar",
    2: "Apr-Jun",
    3: "Jul-Sep",
    4: "Oct-Dec"
  };

  return (
    <div className="w-full p-4 md:p-6 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex flex-col pt-1 py-5">
        <p className="text-2xl font-semibold mb-2">Quarterly Sales Report</p>
        <div className="w-24 h-0.5 bg-orange-600 rounded-full"></div>
      </div>
      {/* Year selector */}
      <div className="flex flex-col md:flex-row md:items-center md:gap-4 mb-4">
        <label htmlFor="year" className="font-semibold text-sm md:text-base">
          Select Year:
        </label>
        <input
          type="number"
          id="year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-32 text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Messages */}
      {loading ? (
        <div className="text-sm text-gray-500">Loading report...</div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : reportData.length === 0 ? (
        <div className="text-sm text-gray-500">No sales data found for {year}.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg">
          <table className="w-full border-collapse border border-gray-300 shadow-inner rounded-md">
            <thead>
              <tr className="bg-gray-100 text-gray-800">
                <th className="border border-gray-300 p-2 text-center font-medium">Quarter</th>
                <th className="border border-gray-300 p-2 text-center font-medium">Total Sales</th>
                <th className="border border-gray-300 p-2 text-center font-medium">Total Orders</th>
                <th className="border border-gray-300 p-2 text-center font-medium">Avg Order Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reportData.map((row) => (
                <tr key={row.Quarter} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-2 text-center font-semibold bg-white">
                   Q{row.Quarter} <span className="text-gray-500 text-sm">({Months[row.Quarter]})</span>
                  </td>
                  <td className="border border-gray-300 p-2 text-center bg-white">${formatCurrency(row.Total_Sales)}</td>
                  <td className="border border-gray-300 p-2 text-center bg-white">{row.Total_Orders ?? 0}</td>
                  <td className="border border-gray-300 p-2 text-center bg-white">${formatCurrency(row.Avg_Order_Value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default QuarterlyReport;
