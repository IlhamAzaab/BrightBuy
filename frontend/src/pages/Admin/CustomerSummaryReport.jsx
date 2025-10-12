import React from "react";
import CustomerOrdersViewer from "../../components/CustomerOrdersViewer";

const CustomerSummaryReport = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">
        Customer-wise Order Summary & Payment Status
      </h1>
      <CustomerOrdersViewer />
    </div>
  );
};

export default CustomerSummaryReport;