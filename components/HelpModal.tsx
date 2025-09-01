import React from 'react';

interface HelpModalProps {
  show: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ show, onClose }) => {
  if (!show) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-gray-900 bg-opacity-80 backdrop-blur-sm flex justify-center items-center z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
    >
      <div 
        className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl shadow-black/30 p-8 max-w-md w-full mx-4 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="help-modal-title" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 to-cyan-400 mb-4">
          Tips for Great Results
        </h2>
        <p className="text-gray-300 mb-6">
          For the best results, use a selfie that shows a clear, front-facing view of yourself and includes some of your upper body. This helps the AI understand your features and posture better, leading to a more realistic final image.
        </p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-fuchsia-600 to-blue-600 hover:from-fuchsia-500 hover:to-blue-500 text-white font-bold py-2 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
            aria-label="Close help dialog"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
