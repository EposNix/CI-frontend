import React, { useState, useEffect } from 'react';

interface BeforeAfterItem {
  before: string;
  after: string;
  label?: string;
}

interface CarouselProps {
  items: BeforeAfterItem[];
}

const BeforeAfterCarousel: React.FC<CarouselProps> = ({ items }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length === 0) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(id);
  }, [items.length]);

  const prev = () => {
    setIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const next = () => {
    setIndex((prev) => (prev + 1) % items.length);
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div
        className="flex transition-transform duration-700 h-full"
        style={{ transform: `translateX(-${index * 100}%)`, width: `${items.length * 100}%` }}
      >
        {items.map((item, i) => (
          <div key={i} className="w-full flex-shrink-0 flex gap-2 sm:gap-4 p-4">
            <div className="w-1/2 rounded-lg overflow-hidden bg-gray-700 flex items-center justify-center">
              {item.before ? (
                <img src={item.before} alt={item.label ? `${item.label} before` : `before ${i + 1}`} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400">Before</span>
              )}
            </div>
            <div className="w-1/2 rounded-lg overflow-hidden bg-gray-700 flex items-center justify-center">
              {item.after ? (
                <img src={item.after} alt={item.label ? `${item.label} after` : `after ${i + 1}`} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400">After</span>
              )}
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-900/50 hover:bg-gray-900/80 text-white rounded-full p-2"
        aria-label="Previous"
      >
        &#10094;
      </button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-900/50 hover:bg-gray-900/80 text-white rounded-full p-2"
        aria-label="Next"
      >
        &#10095;
      </button>
    </div>
  );
};

export default BeforeAfterCarousel;
