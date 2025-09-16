import React from "react";

const Admin = () => {
  return (
    <div style={{ textAlign: "center", marginTop: "60px" }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome, Admin! Manage products, orders, and users from here.</p>
      <div style={{ marginTop: "40px" }}>
        <button style={{ margin: "10px", padding: "10px 20px" }}>
          Manage Products
        </button>
        <button style={{ margin: "10px", padding: "10px 20px" }}>
          Manage Orders
        </button>
        <button style={{ margin: "10px", padding: "10px 20px" }}>
          Manage Users
        </button>
      </div>
    </div>
  );
};

export default Admin;
