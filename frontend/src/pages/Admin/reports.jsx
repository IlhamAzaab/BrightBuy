import React from "react";
import CustomerOrdersViewer from "../../components/CustomerOrdersViewer";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

// Admin Reports page: hosts the CustomerOrdersViewer
// (You can extend this page later with more analytics widgets.)
const ReportsPage = () => {
  return (
    <>
    <Navbar />
    <div>
      <div style={{ padding: "1rem" }}>
        <h1 className="text-2xl font-semibold mb-4">Customer Orders Report</h1>
        <CustomerOrdersViewer />
      </div>
      <div style={{ padding: "1rem" }}>
        <h1 className="text-2xl font-semibold mb-4">Top Selling Products</h1>
        <p>Analytics for top selling products will go here.</p>
      </div>
      <div style={{ padding: "1rem" }}>
        <h1 className="text-2xl font-semibold mb-4">Sales Over Time</h1>
        <p>Analytics for sales over time will go here.</p>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default ReportsPage;
