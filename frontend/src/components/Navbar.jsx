import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";
import searchIcon from "../assets/search_icon.svg";
import userIcon from "../assets/user_icon.svg";
import { AuthContext } from "../context/AuthContext";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:9000";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const isLoggedIn = !!user;
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const isCustomer = user?.role?.toLowerCase() === "customer";

  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

  const desktopRef = useRef(null);
  const mobileRef = useRef(null);

  // --- Search state ---
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [openSuggest, setOpenSuggest] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  const handleNavigation = (path) => {
    navigate(path);
    setDesktopDropdownOpen(false);
    setMobileDropdownOpen(false);
  };

  // Close dropdowns or suggestion box when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (desktopRef.current && !desktopRef.current.contains(event.target)) {
        setDesktopDropdownOpen(false);
      }
      if (mobileRef.current && !mobileRef.current.contains(event.target)) {
        setMobileDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setOpenSuggest(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced fetch suggestions
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setOpenSuggest(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/products/search?q=${encodeURIComponent(query.trim())}`
        );
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json(); // [{Product_ID, Product_Name, Brand, Image_URL}]
        setSuggestions(data);
        setOpenSuggest(true);
        setActiveIndex(-1);
      } catch (e) {
        setSuggestions([]);
        setOpenSuggest(false);
      }
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const goToProduct = (id) => {
    setQuery("");
    setOpenSuggest(false);
    setActiveIndex(-1);
    navigate(`/products/${id}`);
  };

  const onKeyDown = (e) => {
    if (!openSuggest || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick =
        activeIndex >= 0 ? suggestions[activeIndex] : suggestions[0];
      if (pick) goToProduct(pick.Product_ID);
    } else if (e.key === "Escape") {
      setOpenSuggest(false);
      setActiveIndex(-1);
    }
  };

  return (
    <nav className="flex items-center justify-between px-2 md:px-16 lg:px-32 py-3 border-b border-orange-400 shadow-lg shadow-orange-100 bg-gray-50 text-gray-600 relative">
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
            <button onClick={() => navigate("/")} className="hover:text-black hover:text-xl transition-all duration-300">Home</button>
            <button onClick={() => navigate("/products")} className="hover:text-black hover:text-xl transition-all duration-300">Shop</button>
            <button onClick={() => navigate("/about")} className="hover:text-black hover:text-xl transition-all duration-300">About Us</button>
            <button onClick={() => navigate("/contact")} className="hover:text-black hover:text-xl transition-all duration-300">Contact</button>
          </>
        )}
        {!isAdmin && isLoggedIn && (
          <>
            <button onClick={() => navigate("/")} className="hover:text-black hover:text-xl transition-all duration-300">Home</button>
            <button onClick={() => navigate("/products")} className="hover:text-black hover:text-xl transition-all duration-300">Shop</button>
            <button onClick={() => navigate("/products/cart")} className="hover:text-black hover:text-xl transition-all duration-300">Cart</button>
            <button onClick={() => navigate("/about")} className="hover:text-black hover:text-xl transition-all duration-300">About Us</button>
            <button onClick={() => navigate("/contact")} className="hover:text-black hover:text-xl transition-all duration-300">Contact</button>
          </>
        )}
        {isAdmin && (
          <>
            <button onClick={() => navigate("/")} className="hover:text-black">Home</button>
            <button onClick={() => navigate("/products")} className="hover:text-black">Shop</button>
            <button onClick={() => navigate("/orders")} className="hover:text-black">My Orders</button>
            <button onClick={() => navigate("/admin")} className="hover:text-black hover:text-xl transition-all duration-300 border border-orange-600 px-4 py-1.5 rounded-full border-b-4 border-t-4">Admin Dashboard</button>
          </>
        )}
      </div>

      {/* Right-side / Search + Account */}
      <div className="hidden md:flex items-center gap-4 relative">
        {/* Search */}
        <div ref={searchRef} className="relative w-64">
          <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-full px-3 py-2 focus-within:ring-2 focus-within:ring-orange-300">
            <img className="w-4 h-4 opacity-60" src={searchIcon} alt="search" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => suggestions.length && setOpenSuggest(true)}
              onKeyDown={onKeyDown}
              placeholder="Search products…"
              className="flex-1 outline-none text-sm bg-transparent"
            />
          </div>

          {/* Suggestions */}
          {openSuggest && suggestions.length > 0 && (
            <ul className="absolute z-50 mt-2 w-full max-h-80 overflow-auto rounded-xl border border-orange-200 bg-white shadow-xl">
              {suggestions.map((s, idx) => (
                <li
                  key={s.Product_ID}
                  className={`flex items-center gap-3 px-3 py-2 cursor-pointer text-sm hover:bg-orange-50 ${
                    idx === activeIndex ? "bg-orange-50" : ""
                  }`}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => goToProduct(s.Product_ID)}
                >
                  {s.Image_URL ? (
                    <img
                      src={
                        s.Image_URL.startsWith("http")
                          ? s.Image_URL
                          : `${API_BASE}${s.Image_URL.replace(/\\/g, "/")}`
                      }
                      alt=""
                      className="w-8 h-8 rounded object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded bg-gray-100" />
                  )}
                  <div className="flex-1">
                    <div className="text-gray-900">{s.Product_Name}</div>
                    <div className="text-gray-400 text-xs">{s.Brand || "—"}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Account */}
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
              <div className="absolute right-0 mt-2 w-40 text-gray-400 transition-all duration-300 border border-orange-600 rounded-2xl border-b-4 border-t-4 flex flex-col z-50 bg-white">
                <button onClick={() => handleNavigation("/products/cart")} className="px-4 py-2 text-left hover:bg-gray-50 hover:text-black rounded-2xl">Cart</button>
                <button onClick={() => handleNavigation("/orders")} className="px-4 py-2 text-left hover:bg-gray-50 hover:text-black rounded-2xl">My Orders</button>
                <button onClick={() => handleNavigation("/profile")} className="px-4 py-2 text-left hover:bg-gray-50 hover:text-black rounded-2xl">Profile</button>
                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="px-4 py-2 text-left hover:bg-gray-50 hover:text-black rounded-2xl"
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

      {/* Mobile: keep your existing menu (unchanged) */}
      <div className="flex items-center md:hidden gap-3">
        {/* You can optionally add a compact mobile search later */}
        {isAdmin && (
          <>
            <button type="button" onClick={() => navigate("/admin")} className="text-xs border border-orange-600 px-4 py-1.5 rounded-full">
              Admin Dashboard
            </button>
            <button onClick={() => { logout(); navigate("/"); }} className="hover:text-black">
              Logout
            </button>
          </>
        )}
        {!isLoggedIn ? (
          <button type="button" onClick={() => navigate("/login")} className="flex items-center gap-2 hover:text-black transition-transform duration-100 hover:scale-110">
            <img src={userIcon} alt="user icon" className="w-5 h-5" />
            Account
          </button>
        ) : (
          <>
            <button onClick={() => navigate("/")} className="hover:text-black hover:text-xl transition-all duration-300">Home</button>
            <button onClick={() => navigate("/products")} className="hover:text-black hover:text-xl transition-all duration-300">Shop</button>
            <div className="relative" ref={mobileRef}>
              <button
                type="button"
                onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                className="flex items-center gap-2 hover:text-black transition-transform duration-100 hover:scale-110"
              >
                <img src={user?.avatar || "/images/default.jpg"} alt="user avatar" className="w-5 h-5 rounded-full" />
                <span>{user.name}</span>
              </button>
              {mobileDropdownOpen && isCustomer && (
                <div className="flex flex-col mt-2 text-gray-400 transition-all duration-300 border border-orange-600 rounded-2xl border-b-4 border-t-4 z-50 bg-white">
                  <button onClick={() => handleNavigation("/products/cart")} className="px-4 py-2 text-left hover:bg-gray-50 hover:text-black rounded-2xl">Cart</button>
                  <button onClick={() => handleNavigation("/orders")} className="px-4 py-2 text-left hover:bg-gray-50 hover:text-black rounded-2xl">My Orders</button>
                  <button onClick={() => handleNavigation("/profile")} className="px-4 py-2 text-left hover:bg-gray-50 hover:text-black rounded-2xl">Profile</button>
                  <button onClick={() => { logout(); navigate("/"); }} className="px-4 py-2 text-left hover:bg-gray-50 hover:text-black rounded-2xl">Logout</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
