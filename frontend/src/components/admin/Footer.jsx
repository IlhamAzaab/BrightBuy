import React from "react";
import {assets} from "../../assets/assets";

const Footer = () => {
  return (
    <div className="flex md:flex-row flex-col-reverse items-center justify-between text-left w-full px-10">
      <div className="flex items-center gap-4">
        {/* Replace next/image with regular img for React */}
        <img className="w-20 md:w-24" src={assets.logo} alt="logo" />
        <div className="hidden md:block h-7 w-px bg-gray-500/60"></div>
        <p className="py-4 text-center text-xs md:text-sm text-gray-500">
          Copyright 2025 © greatstack.dev All Right Reserved.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <a href="www.google.com">
          <img src={assets.facebook_icon} alt="facebook_icon" />
        </a>
        <a href="www.google.com">
          <img src={assets.twitter_icon} alt="twitter_icon" />
        </a>
        <a href="www.google.com">
          <img src={assets.instagram_icon} alt="instagram_icon" />
        </a>
      </div>
    </div>
  );
};

export default Footer;
