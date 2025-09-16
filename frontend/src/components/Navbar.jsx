// import React, { useContext } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import logo from "../assets/logo.svg";       // replace with your logo image
// import searchIcon from "../assets/search_icon.svg"; // replace with actual paths
// import userIcon from "../assets/user_icon.svg";     // replace with actual paths

// import { AuthContext } from "../context/AuthContext";

// const Navbar = () => {
//   const navigate = useNavigate();
//   const { user, logout } = useContext(AuthContext);

//   // Check role
//   const isSeller = ["admin"].includes(user?.role?.toLowerCase());

//   return (
//     <nav className="flex items-center justify-between px-6 md:px-16 lg:px-32 py-3 border-b border-gray-300 text-gray-600">
//       {/* Logo */}
//       <img
//         src={logo}
//         alt="logo"
//         className="cursor-pointer w-28 md:w-32 transition-transform duration-300 hover:scale-110"
//         onClick={() => navigate("/")}
//       />

//       {/* Links for desktop */}
//       <div className="flex items-center gap-4 lg:gap-10 max-md:hidden">
//         <Link
//           to="/"
//           className="hover:text-black transition-transform duration-100 hover:scale-110"
//         >
//           Home
//         </Link>
//         <Link
//           to="/products"
//           className="hover:text-black transition-transform duration-100 hover:scale-110"
//         >
//           Shop
//         </Link>
//         <Link
//           to="/about"
//           className="hover:text-black transition-transform duration-100 hover:scale-110"
//         >
//           About Us
//         </Link>
//         <Link
//           to="/contact"
//           className="hover:text-black transition-transform duration-100 hover:scale-110"
//         >
//           Contact
//         </Link>
//         {isSeller && (
//           <button
//             onClick={() => navigate("/seller")}
//             className="text-xs border px-4 py-1.5 rounded-full"
//           >
//             Seller Dashboard
//           </button>
//         )}
//       </div>

//       {/* Right-side icons / user */}
//       <ul className="hidden md:flex items-center gap-4">
//         <img className="w-4 h-4" src={searchIcon} alt="search icon" />

//         {user && !isSeller ? (
//           <>
//             <button
//               onClick={() => navigate("/cart")}
//               className="hover:text-black"
//             >
//               Cart
//             </button>
//             <button
//               onClick={() => navigate("/my-orders")}
//               className="hover:text-black"
//             >
//               My Orders
//             </button>
//             <button onClick={logout} className="hover:text-black">
//               Logout
//             </button>
//           </>
//         ) : (
//           <button
//             onClick={() => navigate("/login")}
//             className="flex items-center gap-2 hover:text-black transition-transform duration-100 hover:scale-110"
//           >
//             <img src={userIcon} alt="user icon" className="w-5 h-5" />
//             Account
//           </button>
//         )}
//       </ul>

//       {/* Mobile menu (simplified) */}
//       <div className="flex items-center md:hidden gap-3">
//         {isSeller && (
//           <button
//             onClick={() => navigate("/seller")}
//             className="text-xs border px-4 py-1.5 rounded-full"
//           >
//             Seller Dashboard
//           </button>
//         )}
//         {user ? (
//           <>
//             <button onClick={() => navigate("/")} className="hover:text-black">
//               Home
//             </button>
//             <button
//               onClick={() => navigate("/products")}
//               className="hover:text-black"
//             >
//               Products
//             </button>
//             <button
//               onClick={() => navigate("/cart")}
//               className="hover:text-black"
//             >
//               Cart
//             </button>
//             <button
//               onClick={() => navigate("/my-orders")}
//               className="hover:text-black"
//             >
//               My Orders
//             </button>
//             <button onClick={logout} className="hover:text-black">
//               Logout
//             </button>
//           </>
//         ) : (
//           <button
//             onClick={() => navigate("/login")}
//             className="flex items-center gap-2 hover:text-black transition-transform duration-100 hover:scale-110"
//           >
//             <img src={userIcon} alt="user icon" className="w-5 h-5" />
//             Account
//           </button>
//         )}
//       </div>
//     </nav>
//   );
// };

// export default Navbar;

import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";       // replace with your logo image
import searchIcon from "../assets/search_icon.svg"; // replace with actual paths
import userIcon from "../assets/user_icon.svg";     // replace with actual paths

import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  // Check role
  const isSeller = ["admin"].includes(user?.role?.toLowerCase());


  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-32 py-3 border-b border-gray-300 text-gray-600">
      {/* Logo */}
      <img
        src={logo}
        alt="logo"
        className="cursor-pointer w-28 md:w-32 transition-transform duration-300 hover:scale-110"
        onClick={() => navigate("/")}
      />

      {/* Links for desktop */}
      <div className="flex items-center gap-4 lg:gap-10 max-md:hidden">
        <Link
          to="/"
          className="hover:text-black transition-transform duration-100 hover:scale-110"
        >
          Home
        </Link>
        <Link
          to="/products"
          className="hover:text-black transition-transform duration-100 hover:scale-110"
        >
          Shop
        </Link>
        <Link
          to="/about"
          className="hover:text-black transition-transform duration-100 hover:scale-110"
        >
          About Us
        </Link>
        <Link
          to="/contact"
          className="hover:text-black transition-transform duration-100 hover:scale-110"
        >
          Contact
        </Link>

      </div>

      {/* Right-side icons / user */}
      <ul className="hidden md:flex items-center gap-4">
        <img className="w-4 h-4" src={searchIcon} alt="search icon" />

        {user ? (
          isSeller ? (
            <>
              <button
                onClick={() => navigate("/seller")}
                className="text-s border px-4 py-1.5 rounded-full"
              >
                Seller Dashboard
              </button>
              <button onClick={logout} className="hover:text-black">
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/cart")}
                className="hover:text-black"
              >
                Cart
              </button>
              <button
                onClick={() => navigate("/my-orders")}
                className="hover:text-black"
              >
                My Orders
              </button>
              <button onClick={logout} className="hover:text-black">
                Logout
              </button>
            </>
          )
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 hover:text-black transition-transform duration-100 hover:scale-110"
          >
            <img src={userIcon} alt="user icon" className="w-5 h-5" />
            Account
          </button>
        )}
      </ul>

      {/* Mobile menu (simplified) */}
      <div className="flex items-center md:hidden gap-3">
        {user ? (
          isSeller ? (
            <>
              <button
                onClick={() => navigate("/seller")}
                className="text-xs border px-4 py-1.5 rounded-full"
              >
                Seller Dashboard
              </button>
              <button onClick={logout} className="hover:text-black">
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate("/")} className="hover:text-black">
                Home
              </button>
              <button
                onClick={() => navigate("/products")}
                className="hover:text-black"
              >
                Products
              </button>
              <button
                onClick={() => navigate("/cart")}
                className="hover:text-black"
              >
                Cart
              </button>
              <button
                onClick={() => navigate("/my-orders")}
                className="hover:text-black"
              >
                My Orders
              </button>
              <button onClick={logout} className="hover:text-black">
                Logout
              </button>
            </>
          )
        ) : (
          <button
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

