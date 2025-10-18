import React, { useEffect, useState } from "react";

const TopSellingProductsReport = () => {
  const [report, setReport] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const API = (process.env.REACT_APP_API_BASE || "http://localhost:9000");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        // Format the month and year as 'YYYY-MM'
        const formattedDate = `${selectedYear}-${selectedMonth.padStart(
          2,
          "0"
        )}`;

        const response = await fetch(
          `${API}/api/topselling?month=${formattedDate}`
        );
        const data = await response.json();

        if (response.ok) {
          setReport(data);
        } else {
          console.error(data.error);
        }
      } catch (err) {
        console.error("Error fetching report:", err);
      }
    };

    if (selectedMonth && selectedYear) {
      fetchReport();
    }
  }, [selectedMonth, selectedYear]);

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  return (
    <div className="px-6 md:px-16 lg:px-32 py-12">
      <div className="flex flex-col items-center px-10 md:px-16">
        <div className="flex flex-col items-end pt-12 py-10">
          <p className="text-4xl font-medium">Top Selling Products</p>
          <div className="w-24 h-0.5 bg-orange-600 rounded-full"></div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
        <div className="flex flex-col">
          <label htmlFor="year" className="text-gray-700 font-medium mb-2">
            Enter Year:
          </label>
          <input
            id="year"
            type="text"
            value={selectedYear}
            onChange={handleYearChange}
            placeholder="e.g., 2025"
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="month" className="text-gray-700 font-medium mb-2">
            Select Month:
          </label>
          <select
            id="month"
            value={selectedMonth}
            onChange={handleMonthChange}
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">-- Select a Month --</option>
            <option value="01">January</option>
            <option value="02">February</option>
            <option value="03">March</option>
            <option value="04">April</option>
            <option value="05">May</option>
            <option value="06">June</option>
            <option value="07">July</option>
            <option value="08">August</option>
            <option value="09">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border border-gray-300 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-2 text-left text-gray-600 font-medium">
                Month
              </th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium">
                Product ID
              </th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium">
                Product Name
              </th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium">
                Brand
              </th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium">
                Total Quantity Sold
              </th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium">
                Total Revenue
              </th>
            </tr>
          </thead>
          <tbody>
            {report.length > 0 ? (
              report.map((item, index) => (
                <tr key={index} className="hover:bg-orange-50">
                  <td className="px-2 py-4 text-gray-700">{item.month}</td>
                    <td className="px-6 py-4 text-gray-700">{item.Product_ID}</td>
                  <td className="px-6 py-4 text-gray-700">
                    {item.Product_Name}
                  </td>
                  <td className="px-6 py-4 text-gray-700">{item.Brand}</td>
                  <td className="px-6 py-4 text-gray-700">
                    {item.total_quantity_sold}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {item.total_revenue
                      ? Number(item.total_revenue).toFixed(2)
                      : "N/A"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                  No data available for the selected month and year.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopSellingProductsReport;
