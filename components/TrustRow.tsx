import React from 'react';
import { LockClosedIcon, SparklesIcon } from './icons';

const TrustRow: React.FC = () => {
  return (
    <section className="bg-gray-800 text-gray-200 py-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-8 px-4 text-sm sm:text-base">
        <div className="flex items-center gap-3">
          <LockClosedIcon className="w-6 h-6 text-fuchsia-400" />
          <span>Selfies auto-delete / not used for training</span>
        </div>
        <div className="flex items-center gap-3">
          <SparklesIcon className="w-6 h-6 text-fuchsia-400" />
          <span>Explicit AI disclosure on every image</span>
        </div>
      </div>
    </section>
  );
};

export default TrustRow;
