import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";
import searchIcon from "../assets/search_icon.svg";
import userIcon from "../assets/user_icon.svg";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();

  const { user, logout } = useContext(AuthContext);

  const isLoggedIn = !!user;

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
    <nav className="flex items-center justify-between px-2 md:px-16 lg:px-32 py-3 border-b border-orange-400 shadow-lg shadow-orange-100 bg-gray-50 text-gray-600">
      {/* Logo */}

      <img
        src={logo}
        alt="logo"
        className="cursor-pointer w-28 md:w-32 transition-transform duration-300 hover:scale-110"
        onClick={() => navigate("/")}
      />

      {/* Desktop menu */}
      <div className="flex items-center gap-4 lg:gap-10 max-md:hidden">
        {!isAdmin && !isLoggedIn && (
          <>
            <button
              onClick={() => navigate("/")}
              className="hover:text-black hover:text-xl transition-all duration-300"
            >
              Home
            </button>
            <button
              onClick={() => navigate("/products")}
              className="hover:text-black hover:text-xl transition-all duration-300"
            >
              Shop
            </button>
            <button
              onClick={() => navigate("/about")}
              className="hover:text-black hover:text-xl transition-all duration-300"
            >
              About Us
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="hover:text-black hover:text-xl transition-all duration-300"
            >
              Contact
            </button>
          </>
        )}
        {!isAdmin && isLoggedIn && (
          <>
            <button
              onClick={() => navigate("/")}
              className="hover:text-black hover:text-xl transition-all duration-300"
            >
              Home
            </button>
            <button
              onClick={() => navigate("/products")}
              className="hover:text-black hover:text-xl transition-all duration-300"
            >
              Shop
            </button>
            <button
              onClick={() => navigate("/products/cart")}
              className="hover:text-black hover:text-xl transition-all duration-300"
            >
              Cart
            </button>
            <button
              onClick={() => navigate("/about")}
              className="hover:text-black hover:text-xl transition-all duration-300"
            >
              About Us
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="hover:text-black hover:text-xl transition-all duration-300"
            >
              Contact
            </button>
          </>
        )}
        {isAdmin && (
          <>
            <button onClick={() => navigate("/")} className="hover:text-black">
              Home
            </button>
            <button
              onClick={() => navigate("/products")}
              className="hover:text-black"
            >
              Shop
            </button>
            <button
              onClick={() => navigate("/orders")}
              className="hover:text-black"
            >
              My Orders
            </button>
            <button
              onClick={() => navigate("/admin")}
              className="hover:text-black hover:text-xl transition-all duration-300 border border-orange-600 px-4 py-1.5 rounded-full border-b-4 border-t-4"
            >
              Admin Dashboard
            </button>
          </>
        )}
      </div>

      {/* Right-side / Account */}

      <div className="hidden md:flex items-center gap-4 relative">
        <img className="w-4 h-4" src={searchIcon} alt="search icon" />

        {isLoggedIn ? (
          <div className="relative px-8" ref={desktopRef}>
            <button
              type="button"
              onClick={() => setDesktopDropdownOpen(!desktopDropdownOpen)}
              className="flex items-center gap-2 hover:text-black transition-transform duration-300 hover:scale-110"
            >
              <img
                src={
                  user.image_URL
                    ? `http://localhost:9000${user.image_URL}`
                    : "/images/default.jpg"
                }
                alt="user avatar"
                className="w-5 h-5 rounded-full"
              />
              <span>{user.name}</span>
            </button>

            {desktopDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-gray-100 text-gray-800 transition-all duration-300 border border-orange-600 rounded-2xl border-b-4 border-t-4 flex flex-col z-50">
                <button
                  onClick={() => handleNavigation("/products/cart")}
                  className="px-4 py-2 text-left hover:bg-gray-50 hover:text-black transition-all duration-100 rounded-2xl"
                >
                  Cart
                </button>
                <button
                  onClick={() => handleNavigation("/orders")}
                  className="px-4 py-2 text-left hover:bg-gray-50 hover:text-black transition-all duration-100 rounded-2xl"
                >
                  My Orders
                </button>
                <button
                  onClick={() => handleNavigation("/profile")}
                  className="px-4 py-2 text-left hover:bg-gray-50 hover:text-black transition-all duration-100 rounded-2xl"
                >
                  Profile
                </button>
                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="px-4 py-2 text-left hover:bg-gray-50 hover:text-black transition-all duration-100 rounded-2xl"
                >
                  Logout
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
          <>
            <button
              type="button"
              onClick={() => navigate("/admin")}
              className="text-xs border border-orange-600 px-4 py-1.5 rounded-full"
            >
              Admin Dashboard
            </button>
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="hover:text-black"
            >
              Logout
            </button>
          </>
        )}

        {isLoggedIn ? (
          <>
            <button
              onClick={() => navigate("/")}
              className="hover:text-black hover:text-xl transition-all duration-300"
            >
              Home
            </button>
            <button
              onClick={() => navigate("/products")}
              className="hover:text-black hover:text-xl transition-all duration-300"
            >
              Shop
            </button>

            <div className="relative" ref={mobileRef}>
              <button
                type="button"
                onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                className="flex items-center gap-2 hover:text-black transition-transform duration-100 hover:scale-110"
              >
                <img
                  src={user.avatar}
                  alt="user avatar"
                  className="w-5 h-5 rounded-full"
                />
                <span>{user.name}</span>
              </button>

              {mobileDropdownOpen && isCustomer && (
                <div className="flex flex-col mt-2 text-gray-400 transition-all duration-300 border border-orange-600 rounded-2xl border-b-4 border-t-4 z-50">
                  <button
                    onClick={() => handleNavigation("/products/cart")}
                    className="px-4 py-2 text-left hover:bg-gray-50 hover:text-black transition-all duration-100 rounded-2xl"
                  >
                    Cart
                  </button>
                  <button
                    onClick={() => handleNavigation("/orders")}
                    className="px-4 py-2 text-left hover:bg-gray-50 hover:text-black transition-all duration-100 rounded-2xl"
                  >
                    My Orders
                  </button>
                  <button
                    onClick={() => handleNavigation("/profile")}
                    className="px-4 py-2 text-left hover:bg-gray-50 hover:text-black transition-all duration-100 rounded-2xl"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                    className="px-4 py-2 text-left hover:bg-gray-50 hover:text-black transition-all duration-100 rounded-2xl"
                  >
                    Logout
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
