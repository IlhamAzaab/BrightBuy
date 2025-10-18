import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";

const HeaderSlider = () => {
  const [sliderData, setSliderData] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // Fetch slider data from backend
  useEffect(() => {
    const fetchSliderData = async () => {
      try {
        const res = await fetch("http://localhost:9000/api/headerslider");
        const data = await res.json();

        const formatted = data.map((item, index) => ({
          id: item.Category_ID,
          productId: item.Product_ID, // for Add to Cart
          title: `Explore ${item.Category_Name} - ${item.Product_Name}`,
          offer: `Starting from $${item.Price}`,
          buttonText1: "Shop",
          buttonText2: "View Details",
          imgSrc: item.Image_URL || assets.default_image,
        }));

        setSliderData(formatted);
      } catch (error) {
        console.error("Error fetching slider data:", error);
      }
    };

    fetchSliderData();
  }, []);

  // Auto-slide
  useEffect(() => {
    if (sliderData.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderData.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [sliderData.length]);

  const handleSlideChange = (index) => setCurrentSlide(index);

  if (sliderData.length === 0) {
    return <p className="text-center mt-10 text-gray-500">Loading slider...</p>;
  }

  return (
    <div className="overflow-hidden relative w-full">
      {/* Slides */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {sliderData.map((slide, index) => (
          <div
            key={`${slide.id}-${index}`} // ✅ unique key
            className="flex flex-col-reverse md:flex-row items-center justify-between bg-gray-100 py-5 md:px-10 px-4 mt-4 rounded-xl min-w-full"
          >
            {/* Text Section */}
            <div className="md:pl-6 mt-6 md:mt-0 flex-1">
              <p className="text-sm text-green-500 pb-1">{slide.offer}</p>
              <h1 className="max-w-md text-xl text-blue-900 md:text-2xl font-semibold leading-snug">
                {slide.title}
              </h1>
              <div className="flex items-center mt-3 md:mt-4 gap-2">
                <button
                  onClick={() => navigate(`/products/${slide.productId}`)}
                  className="md:px-8 px-6 md:py-2 py-1.5 bg-orange-600 rounded-full text-white text-sm md:text-base font-medium"
                >
                  {slide.buttonText1}
                </button>
                <button
                  onClick={() => navigate(`/products/${slide.productId}`)}
                  className="group flex items-center gap-2 px-4 md:px-6 py-1.5 md:py-2.5 text-sm md:text-base font-medium"
                >
                  {slide.buttonText2}
                  <img
                    className="group-hover:translate-x-1 transition w-4 md:w-5"
                    src={assets.arrow_icon}
                    alt="arrow_icon"
                  />
                </button>
              </div>
            </div>

            {/* Image Section */}
            <div className="flex items-center justify-center flex-1">
              <img
                className="md:w-56 w-40 object-contain"
                src={slide.imgSrc}
                alt={`Slide ${index + 1}`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Dots Navigation */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {sliderData.map((_, index) => (
          <div
            key={`dot-${index}`}
            onClick={() => handleSlideChange(index)}
            className={`h-2 w-2 rounded-full cursor-pointer transition-all ${
              currentSlide === index
                ? "bg-orange-600 scale-110"
                : "bg-gray-500/30"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default HeaderSlider;
