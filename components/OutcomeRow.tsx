import React from 'react';

interface OutcomeCategory {
  title: string;
  images: string[];
}

const OutcomeRow: React.FC = () => {
  const categories: OutcomeCategory[] = [
    { title: 'Creators', images: ['', '', ''] },
    { title: 'Shops', images: ['', '', ''] },
    { title: 'Travel', images: ['', '', ''] },
    { title: 'Dating', images: ['', '', ''] },
  ];

  return (
    <section className="py-12 bg-gray-900 text-white">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Made for:</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {categories.map((cat) => (
            <div key={cat.title} className="text-center">
              <h3 className="text-lg font-semibold mb-3">{cat.title}</h3>
              <div className="grid grid-cols-3 gap-2">
                {cat.images.map((src, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-gray-700 rounded-md flex items-center justify-center text-gray-500 text-xs"
                  >
                    {src ? (
                      <img src={src} alt={`${cat.title} ${i + 1}`} className="w-full h-full object-cover rounded-md" />
                    ) : (
                      <span>img</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OutcomeRow;
