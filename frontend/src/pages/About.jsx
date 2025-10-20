import React from "react";
import Navbar from "../components/Navbar";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b py-6 bg-white shadow-sm">
        <p className="text-2xl md:text-3xl text-gray-600 px-10 hover:text-orange-600">
          About <span className="font-semibold text-orange-600 hover:text-gray-600">Us</span>
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20 py-10 space-y-8 text-gray-700">
        {/* Introduction */}
        <section>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">
            Welcome to BrightBuy
          </h2>
          <p className="text-lg leading-relaxed">
            BrightBuy is a Texas-based retail chain specializing in high-quality{" "}
            <strong>consumer electronics</strong> and smart gadgets. Established
            to bring technology closer to people, BrightBuy has expanded its
            services from physical stores to an advanced{" "}
            <strong>online shopping and order management system</strong>. Our
            goal is to make shopping for the latest tech products fast, secure,
            and convenient for everyone in Texas.
          </p>
        </section>

        {/* Mission */}
        <section>
          <h3 className="text-xl md:text-2xl font-semibold text-orange-600 mb-3">
            Our Mission
          </h3>
          <p className="leading-relaxed">
            At BrightBuy, our mission is to provide customers with an easy,
            transparent, and enjoyable shopping experience. We aim to bridge the
            gap between traditional retail and e-commerce by offering:
          </p>
          <ul className="list-disc list-inside mt-3 space-y-1">
            <li>Accurate product availability and inventory tracking</li>
            <li>Fast and reliable delivery or store pickup options</li>
            <li>Secure payment methods including cash and card options</li>
            <li>Exceptional customer service and after-sales support</li>
          </ul>
        </section>

        {/* Values */}
        <section>
          <h3 className="text-xl md:text-2xl font-semibold text-orange-600 mb-3">
            Our Values
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                🧡 Customer First
              </h4>
              <p>
                We focus on delivering genuine value to our customers through
                quality products, fair pricing, and reliable service.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                ⚙️ Innovation
              </h4>
              <p>
                We embrace modern technology to enhance shopping convenience and
                provide up-to-date features in our digital platforms.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                🤝 Integrity
              </h4>
              <p>
                Honesty, transparency, and trust form the foundation of every
                transaction and customer relationship.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                🌱 Sustainability
              </h4>
              <p>
                We promote responsible sourcing and energy-efficient products to
                support a sustainable future for Texas and beyond.
              </p>
            </div>
          </div>
        </section>

        {/* Company Overview */}
        <section>
          <h3 className="text-xl md:text-2xl font-semibold text-orange-600 mb-3">
            Our Journey
          </h3>
          <p className="leading-relaxed">
            What started as a small electronics store in Dallas has now grown
            into a trusted regional brand serving customers across Texas. With
            our new online platform, we continue to evolve and meet the needs of
            tech-savvy customers by integrating smart retail management and
            efficient logistics.
          </p>
        </section>

        {/* Address Section */}
        <section className="bg-orange-50 p-6 rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Visit Our Store
          </h3>
          <p>
            <strong>Address:</strong> 1450 Commerce Street, Suite 200, Dallas,
            Texas 75201, USA
          </p>
          <p>
            <strong>Phone:</strong> (214) 555-4829
          </p>
          <p>
            <strong>Email:</strong>{" "}
            <a
              href="mailto:support@brightbuy.com"
              className="text-blue-600 hover:underline"
            >
              support@brightbuy.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;
