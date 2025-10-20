import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import { AuthContext } from "../../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  return (
    <div className="flex items-left px-4 md:px-10 border-b-2 border-orange-400 justify-between">
      <img
        onClick={() => navigate("/")}
        className="w-28 lg:w-32 cursor-pointer"
        src={assets.logo}
        alt="Logo"
      />
      <div className="flex items-center gap-10 lg:gap-10 max-md:hidden">
        <button onClick={() => navigate("/")} className="text-slate-600 hover:text-black hover:text-xl transition-all duration-200">Home</button>
        <button onClick={() => navigate("/products")} className="text-slate-600 hover:text-black hover:text-xl transition-all duration-200">Shop</button>
        <button onClick={() => navigate("/orders")} className="text-slate-600 hover:text-black hover:text-xl transition-all duration-200">My orders</button>
        <button onClick={() => navigate("/products/cart")} className="text-slate-600 hover:text-black hover:text-xl transition-all duration-200">cart</button>
      </div>
      <div className="py-5">
        <button
          className="bg-gray-500 hover:bg-gray-800 transition-all duration-300 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm"
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
