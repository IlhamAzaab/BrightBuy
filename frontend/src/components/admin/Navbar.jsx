import React from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets'; // Keep your assets import

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center px-4 md:px-8 py-3 justify-between border-b">
      <img
        onClick={() => navigate('/')}
        className="w-28 lg:w-32 cursor-pointer"
        src={assets.logo}
        alt="Logo"
      />
      <button className="bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm">
        Logout
      </button>
    </div>
  );
};

export default Navbar;
