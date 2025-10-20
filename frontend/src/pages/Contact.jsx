import React from "react";
import Navbar from "../components/Navbar"

const Contact = () => {
  return (

    <div>
      <Navbar/>
    <div className="min-h-screen bg-gray-50 py-12 px-6 md:px-16 lg:px-32">
      
      <h1 className="text-3xl font-bold text-gray-900  mb-8 text-center">
        Contact Us
      </h1>

      {/* Contact Information */}
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Get in Touch
          </h2>
          <p className="text-gray-600 mb-4">
            We’d love to hear from you! Whether you have a question about our
            products, delivery options, or store pickup, our team is here to
            help.
          </p>

          <div className="space-y-3 text-gray-700">
            <p>
              <strong>📍 Address:</strong><br />
              BrightBuy Electronics<br />
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
                className="text-blue-600 hover:underline"
              >
                support@brightbuy.com
              </a>
            </p>
            <p>
              <strong>🕒 Store Hours:</strong><br />
              Monday – Friday: 9:00 AM – 8:00 PM<br />
              Saturday: 10:00 AM – 6:00 PM<br />
              Sunday: Closed
            </p>
          </div>

          <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800">
              Store Pickup Available
            </h3>
            <p className="text-gray-700 text-sm mt-1">
              Choose <strong>“Store Pickup”</strong> at checkout to collect your
              order directly from our Dallas store once you receive a
              confirmation email.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Send Us a Message
          </h2>
          <form className="bg-white shadow-md rounded-lg p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Your name"
                className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Message
              </label>
              <textarea
                rows="4"
                placeholder="How can we help you?"
                className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-400"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>

      {/* Map Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Visit Our Store
        </h2>
        <iframe
          title="BrightBuy Store Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3348.384664823591!2d-96.8004514!3d32.7787457!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x864e9914e6b5c1b9%3A0x5dd50ad97a61a4d!2sCommerce%20St%2C%20Dallas%2C%20TX%2075201!5e0!3m2!1sen!2sus!4v1697731101000!5m2!1sen!2sus"
          width="100%"
          height="350"
          allowFullScreen=""
          loading="lazy"
          className="rounded-lg shadow-md"
        ></iframe>
      </div>
    </div>
    </div>
    
  );
};

export default Contact;
