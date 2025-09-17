import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";
import searchIcon from "../assets/search_icon.svg";
import userIcon from "../assets/user_icon.svg";
import { AuthContext } from "../context/AuthContext"; // make sure you import your context

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

  const desktopRef = useRef(null);
  const mobileRef = useRef(null);

  const isAdmin = user?.role?.toLowerCase() === "admin";
  const isCustomer = user?.role?.toLowerCase() === "customer";

  const handleNavigation = (path) => {
    navigate(path);
    setDesktopDropdownOpen(false);
    setMobileDropdownOpen(false);
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (desktopRef.current && !desktopRef.current.contains(event.target)) {
        setDesktopDropdownOpen(false);
      }
      if (mobileRef.current && !mobileRef.current.contains(event.target)) {
        setMobileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-32 py-3 border-b border-gray-300 text-gray-600 relative">
      {/* Logo */}
      <img
        src={logo}
        alt="logo"
        className="cursor-pointer w-28 md:w-32 transition-transform duration-300 hover:scale-110"
        onClick={() => navigate("/")}
      />

      {/* Desktop menu */}
      <div className="flex items-center gap-4 lg:gap-10 max-md:hidden">
        <button onClick={() => navigate("/")} className="hover:text-black">
          Home
        </button>
        <button onClick={() => navigate("/products")} className="hover:text-black">
          Shop
        </button>
        <button onClick={() => navigate("/about")} className="hover:text-black">
          About Us
        </button>
        <button onClick={() => navigate("/contact")} className="hover:text-black">
          Contact
        </button>

        {isAdmin && (
          <button
            type="button"
            onClick={() => navigate("/admin")}
            className="text-xs border px-4 py-1.5 rounded-full"
          >
            Admin Dashboard
          </button>
        )}
      </div>

      {/* Right-side / Account */}
      <div className="hidden md:flex items-center gap-4 relative">
        <img className="w-4 h-4" src={searchIcon} alt="search icon" />

        {user?.isLoggedIn ? (
          <div className="relative" ref={desktopRef}>
            <button
              type="button"
              onClick={() => setDesktopDropdownOpen(!desktopDropdownOpen)}
              className="flex items-center gap-2 hover:text-black transition-transform duration-100 hover:scale-110"
            >
              <img
                src={user.avatar || userIcon}
                alt="user avatar"
                className="w-5 h-5 rounded-full"
              />
              <span>{user.name}</span>
            </button>

            {desktopDropdownOpen && isCustomer && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded-md shadow-lg flex flex-col z-50">
                <button
                  type="button"
                  onClick={() => handleNavigation("/cart")}
                  className="px-4 py-2 text-left hover:bg-gray-100"
                >
                  Cart
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigation("/my-orders")}
                  className="px-4 py-2 text-left hover:bg-gray-100"
                >
                  My Orders
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigation("/profile")}
                  className="px-4 py-2 text-left hover:bg-gray-100"
                >
                  Profile
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 hover:text-black transition-transform duration-100 hover:scale-110"
          >
            <img src={userIcon} alt="user icon" className="w-5 h-5" />
            Account
          </button>
        )}
      </div>

      {/* Mobile menu */}
      <div className="flex items-center md:hidden gap-3">
        {isAdmin && (
          <button
            type="button"
            onClick={() => navigate("/admin")}
            className="text-xs border px-4 py-1.5 rounded-full"
          >
            Admin Dashboard
          </button>
        )}

        {user?.isLoggedIn ? (
          <>
            <button type="button" onClick={() => navigate("/")} className="hover:text-black">
              Home
            </button>
            <button type="button" onClick={() => navigate("/products")} className="hover:text-black">
              Products
            </button>

            <div className="relative" ref={mobileRef}>
              <button
                type="button"
                onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                className="flex items-center gap-2 hover:text-black transition-transform duration-100 hover:scale-110"
              >
                <img
                  src={user.avatar || userIcon}
                  alt="user avatar"
                  className="w-5 h-5 rounded-full"
                />
                <span>{user.name}</span>
              </button>

              {mobileDropdownOpen && isCustomer && (
                <div className="flex flex-col mt-2 bg-white border border-gray-300 rounded-md shadow-lg z-50">
                  <button
                    type="button"
                    onClick={() => handleNavigation("/cart")}
                    className="px-4 py-2 text-left hover:bg-gray-100"
                  >
                    Cart
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigation("/my-orders")}
                    className="px-4 py-2 text-left hover:bg-gray-100"
                  >
                    My Orders
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigation("/profile")}
                    className="px-4 py-2 text-left hover:bg-gray-100"
                  >
                    Profile
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 hover:text-black transition-transform duration-100 hover:scale-110"
          >
            <img src={userIcon} alt="user icon" className="w-5 h-5" />
            Account
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
