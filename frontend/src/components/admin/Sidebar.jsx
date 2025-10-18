import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { ChevronDown, ChevronUp } from 'lucide-react'; // for expand/collapse icons

const Sidebar = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const [openReports, setOpenReports] = useState(false);

  const menuItems = [
    { name: 'Add Product', path: '/admin/addproduct', icon: assets.add_icon },
    { name: 'Product List', path: '/admin/productlist', icon: assets.product_list_icon },
    { name: 'Add Admin', path: '/admin/addadmin', icon: assets.order_icon },
    { name: 'Reports', icon: assets.menu_icon, isParent: true },
  ];

  // Nested report items
  const reportItems = [
    { name: 'Quarterly Sales Report', path: '/admin/report/quarterly-sales' },
    { name: 'Top-Selling Products', path: '/admin/report/top-products' },
    { name: 'Category-wise Orders', path: '/admin/report/category-orders' },
    { name: 'Delivery Time Estimates', path: '/admin/report/delivery-time' },
    { name: 'Customer Summary & Payments', path: '/admin/report/customer-summary' },
  ];

  return (
    <div className="md:w-64 w-16 border-r min-h-screen text-base border-gray-300 py-2 flex flex-col bg-white">
      {menuItems.map((item) => {
        const isActive = pathname === item.path;

        if (item.isParent) {
          return (
            <div key={item.name}>
              <button
                onClick={() => setOpenReports(!openReports)}
                className={`w-full flex items-center py-3 px-4 gap-3 text-left ${
                  openReports
                    ? 'bg-orange-600/10 border-r-4 md:border-r-[6px] border-orange-500/90'
                    : 'hover:bg-gray-100/90'
                }`}
              >
                <img
                  src={item.icon}
                  alt="reports_icon"
                  className="w-7 h-7"
                />
                <p className="md:block hidden">{item.name}</p>
                <span className="ml-auto md:block hidden">
                  {openReports ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </span>
              </button>

              {openReports && (
                <div className="ml-6 border-l border-gray-300 pl-3">
                  {reportItems.map((sub) => {
                    const isSubActive = pathname === sub.path;
                    return (
                      <Link to={sub.path} key={sub.name}>
                        <div
                          className={`py-2 px-2 text-sm ${
                            isSubActive
                              ? 'text-orange-600 font-semibold'
                              : 'text-gray-600 hover:text-orange-500'
                          }`}
                        >
                          {sub.name}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }

        return (
          <Link to={item.path} key={item.name}>
            <div
              className={`flex items-center py-3 px-4 gap-3 ${
                isActive
                  ? 'border-r-4 md:border-r-[6px] bg-orange-600/10 border-orange-500/90'
                  : 'hover:bg-gray-100/90 border-white'
              }`}
            >
              <img
                src={item.icon}
                alt={`${item.name.toLowerCase()}_icon`}
                className="w-7 h-7"
              />
              <p className="md:block hidden text-center">{item.name}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default Sidebar;
