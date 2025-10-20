import React from "react";
import { assets } from "../assets/assets";

const Footer = () => {
  return (
    <footer>
      <div className="flex flex-col md:flex-row items-start justify-left px-4 md:px-16 lg:px-32 gap-15 py-14 border border-orange-500 text-gray-500">
        {/* Logo & Description */}
        <div className="w-4/5 ml-4">
          {" "}
          {/* Added margin-left to shift the logo slightly left */}
          <img className="w-20 md:w-24" src={assets.logo} alt="logo" />
          <p className="mt-6 text-sm">
            BrightBuy is your one-stop e-commerce platform, offering a wide
            range of products with flexible delivery options and secure payment
            methods. Shop with ease and confidence, and enjoy a seamless online
            shopping experience tailored to your needs.
          </p>
        </div>

        {/* Company Links */}
        <div className="w-1/2 flex items-center justify-start md:justify-center">
          <div>
            <h2 className="font-medium text-gray-900 mb-5">Company</h2>
            <ul className="text-sm space-y-2">
              <li>
                <a className="hover:underline transition" href="/home">
                  Home
                </a>
              </li>
              <li>
                <a className="hover:underline transition" href="/about">
                  About us
                </a>
              </li>
              <li>
                <a className="hover:underline transition" href="/contact">
                  Contact us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="w-1/2 flex items-start justify-start md:justify-center">
          <div>
            <h2 className="font-medium text-gray-900 mb-5">Get in touch</h2>
            <div className="text-sm space-y-2">
              <p>+94 75-958-7979</p>
              <p>@mimilhamazaab51@gmail.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <p className="py-4 text-center text-xs md:text-sm">
        Copyright 2025 © ilhamazaab All Right Reserved.
      </p>
    </footer>
  );
};

export default Footer;
