import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const About = () => {
  return (
    <div>
        <Navbar />
        <div className="flex items-center justify-between mb-8 border-b py-6">
            <p className="text-2xl md:text-3xl text-gray-500 px-10 hover:text-orange-600">
              About <span className="font-medium text-orange-600 hover:text-gray-500">BrightBuy</span>
            </p>
        </div>
        <div className="px-10 py-6">
          <p className="text-gray-600 mb-4">
            BrightBuy is a modern e-commerce platform designed to provide users with a seamless shopping experience. Whether you're looking for the latest gadgets, fashion, or everyday essentials, BrightBuy has you covered.
          </p>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Key Features</h3>
          <ul className="list-disc list-inside text-gray-600 mb-4">
            <li>Wide range of products across multiple categories.</li>
            <li>Two delivery options: Standard Delivery and Store Pickup.</li>
            <li>Flexible payment methods: Online Payment and Cash on Delivery.</li>
            <li>Admin dashboard with detailed reports and analytics.</li>
          </ul>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Our Mission</h3>
          <p className="text-gray-600 mb-4">
            At BrightBuy, our mission is to make online shopping easy, accessible, and enjoyable for everyone. We strive to offer high-quality products, reliable delivery options, and exceptional customer service.
          </p>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">For Our Users</h3>
          <p className="text-gray-600 mb-4">
            Shop with confidence and convenience. Choose your preferred delivery method and payment option, and enjoy a hassle-free shopping experience.
          </p>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">For Our Admins</h3>
          <p className="text-gray-600">
            Gain valuable insights with our comprehensive reporting tools. Monitor sales, track performance, and make informed decisions to grow your business.
          </p>
        </div>
        <Footer />
      </div>
  )
}

export default About
