import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Contact = () => {
  return (
    <div>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Contact Us</h1>
        <p className="text-gray-600 mb-8 text-center">
          Have questions or need assistance? We're here to help! Reach out to us
          using the form below or through our contact details.
        </p>
        <form className="w-full max-w-md bg-white shadow-md rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Name</label>
            <input
              type="text"
              placeholder="Your Name"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="Your Email"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Message
            </label>
            <textarea
              placeholder="Your Message"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="5"
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full p-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition"
          >
            Send Message
          </button>
        </form>
        <div className="mt-12 text-center">
          <p className="text-gray-600">Or reach us directly at:</p>
          <p className="text-gray-800 font-medium">+94 75-958-7979</p>
          <p className="text-gray-800 font-medium">mimilhamazaab51@gmail.com</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
