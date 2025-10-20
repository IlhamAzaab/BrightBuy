import React from "react";
import { assets } from "../assets/assets";

const Footer = () => {
  return (
    <footer className="bg-gray-50 text-gray-600 border-t border-gray-300">
      {/* Main Footer Section */}
      <div className="flex flex-col md:flex-row items-start justify-between px-6 md:px-16 lg:px-32 gap-10 py-14 text-sm">
        {/* Logo & Description */}
        <div className="w-full md:w-1/3">
          <img className="w-24 md:w-28" src={assets.logo} alt="BrightBuy logo" />
          <p className="mt-6 leading-relaxed text-gray-600">
            BrightBuy is a Texas-based consumer electronics retailer offering a wide
            range of products — from smartphones to smart home devices. Our mission is
            to provide a seamless online and in-store shopping experience backed by
            reliable service and fast delivery.
          </p>
        </div>

        {/* Company Links */}
        <div className="w-full md:w-1/4">
          <h2 className="font-semibold text-gray-900 mb-5">Company</h2>
          <ul className="space-y-2">
            <li>
              <a href="/" className="hover:text-orange-600 transition">
                Home
              </a>
            </li>
            <li>
              <a href="/about" className="hover:text-orange-600 transition">
                About Us
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:text-orange-600 transition">
                Contact Us
              </a>
            </li>
            <li>
              <a href="/privacy-policy" className="hover:text-orange-600 transition">
                Privacy Policy
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="w-full md:w-1/3">
          <h2 className="font-semibold text-gray-900 mb-5">Get in Touch</h2>
          <div className="space-y-2">
            <p>
              <strong>📍 Address:</strong><br />
              1450 Commerce Street, Suite 200<br />
              Dallas, Texas 75201, USA
            </p>
            <p>
              <strong>📞 Phone:</strong> (214) 555-4829
            </p>
            <p>
              <strong>✉️ Email:</strong>{" "}
              <a
                href="mailto:support@brightbuy.com"
                className="text-orange-600 hover:underline"
              >
                support@brightbuy.com
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-gray-200 text-center py-4 text-xs md:text-sm bg-white">
        <p>
          © {new Date().getFullYear()} <span className="font-semibold">BrightBuy</span>. 
          All Rights Reserved. | Designed & Developed by{" "}
          <span className="text-orange-600 font-medium">ilham azaab</span>.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
