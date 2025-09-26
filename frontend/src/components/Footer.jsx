import React from "react";
import {assets} from "../assets/assets";

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="flex md:flex-row flex-col-reverse items-center justify-between text-left w-full px-10 py-4 gap-4">
      <div className="flex items-center gap-4">
        <img className="hidden md:block" src={assets.logo} alt="BrightBuy logo" />
        <div className="hidden md:block h-7 w-px bg-gray-500/60" aria-hidden="true"></div>
        <p className="text-xs md:text-sm text-gray-500">
          &copy; {year} BrightBuy. All rights reserved.
        </p>
      </div>
      <nav aria-label="Social media" className="flex items-center gap-3">
        <a
          href="https://www.facebook.com/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          className="inline-flex focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded"
        >
          <img src={assets.facebook_icon} alt="Facebook" />
        </a>
        <a
          href="https://x.com/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X (Twitter)"
          className="inline-flex focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded"
        >
          <img src={assets.twitter_icon} alt="X (Twitter)" />
        </a>
        <a
          href="https://www.instagram.com/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="inline-flex focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 rounded"
        >
          <img src={assets.instagram_icon} alt="Instagram" />
        </a>
      </nav>
    </footer>
  );
};

export default Footer;
