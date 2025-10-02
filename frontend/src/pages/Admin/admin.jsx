import React from 'react';
import Navbar from '../../components/admin/Navbar';
import Footer from '../../components/admin/Footer';
import Sidebar from '../../components/admin/Sidebar';
import { Outlet } from 'react-router-dom';

const admin = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 p-4">
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default admin;
