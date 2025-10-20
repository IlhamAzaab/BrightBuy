// src/pages/Animation.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Animation = () => {
  const [showBadge, setShowBadge] = useState(false);

  const triggerAnimation = () => {
    setShowBadge(true);

    // hide after 3 seconds
    setTimeout(() => {
      setShowBadge(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/*Success Badge Animation */}
      <AnimatePresence>
        {showBadge && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="fixed top-16 left-0 w-full flex justify-center z-50"
          >
            <div className="text-m tracking-wide text-green-700 bg-green-100 border-2 border-green-300 px-12 py-2 rounded-full shadow-xl">
              Order Placed Successfully!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex flex-col items-center justify-center h-full pt-40">
        <h1 className="text-3xl font-semibold mb-6">Animation Test Page</h1>
        <button
          onClick={triggerAnimation}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Show Success Badge
        </button>
      </div>
    </div>
  );
};

export default Animation;
