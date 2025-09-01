
import React, { useState, useEffect } from 'react';

const loadingMessages = [
  "Scouting for the perfect location...",
  "Generating a virtual backdrop...",
  "Warming up the AI's imagination...",
  "Finding the perfect lighting...",
  "Compositing your masterpiece...",
  "Blending pixels with precision...",
  "Adding a touch of magic...",
  "Almost there, the results will be stunning!"
];

const LoadingOverlay: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 bg-gray-900 bg-opacity-80 backdrop-blur-sm flex flex-col justify-center items-center z-50">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-fuchsia-500"></div>
      <p className="text-white text-lg mt-6 font-semibold tracking-wide transition-opacity duration-500">
        {loadingMessages[messageIndex]}
      </p>
    </div>
  );
};

export default LoadingOverlay;
