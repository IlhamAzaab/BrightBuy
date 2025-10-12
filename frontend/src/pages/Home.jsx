import React from "react";
import Navbar from "../components/Navbar";
import HeaderSlider from "../components/HeaderSlider";
// import HomeProducts from "../components/HomeProducts";
// import Banner from "../components/Banner";
// import NewsLetter from "../components/NewsLetter";
// import FeaturedProduct from "../components/FeaturedProduct";
import CustomerProductList from "./Customerproductlistpage/CustomerProductsList";
const Home = () => {
  return (
    <>
      <CustomerProductList />
      <HeaderSlider />
      {/* 
      <div className="px-6 md:px-16 lg:px-32">
        <HomeProducts />
        <FeaturedProduct />
        <Banner />
        <NewsLetter />
      </div>
      */}
    </>
  );
};

export default Home;
