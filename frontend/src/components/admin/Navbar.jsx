import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets'; // Keep your assets import
import { AuthContext } from "../../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  return (
    <div className="flex items-center px-4 md:px-8 py-3 justify-between border-b">
      <img
        onClick={() => navigate('/')}
        className="w-28 lg:w-32 cursor-pointer"
        src={assets.logo}
        alt="Logo"
      />
      <button className="bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm" onClick={() => {logout(); navigate("/")}}>
        Logout
      </button>
    </div>
  );
};

export default Navbar;
