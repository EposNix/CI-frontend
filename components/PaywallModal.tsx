import React from 'react';
import { CreditCardIcon } from './icons';

interface PaywallModalProps {
  show: boolean;
  onClose: () => void;
  onPay: () => void;
  remainingGenerations?: number;
}

const PaywallModal: React.FC<PaywallModalProps> = ({ show, onClose, onPay, remainingGenerations = 0 }) => {
  if (!show) {
    return null;
  }

  const isOutOfCredits = remainingGenerations === 0;
  const isLowCredits = remainingGenerations > 0 && remainingGenerations <= 2;

  return (
    <div 
      className="fixed inset-0 bg-gray-900 bg-opacity-80 backdrop-blur-sm flex justify-center items-center z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="paywall-modal-title"
    >
      <div 
        className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl shadow-black/30 p-8 max-w-md w-full mx-4 transform transition-all text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <CreditCardIcon className={`w-16 h-16 mx-auto mb-4 ${isOutOfCredits ? 'text-red-400' : 'text-fuchsia-400'}`} />
        <h2 id="paywall-modal-title" className="text-2xl font-bold text-gray-100 mb-2">
          {isOutOfCredits ? 'Out of Credits!' : isLowCredits ? 'Running Low on Credits' : 'Get More Credits'}
        </h2>
        <p className="text-gray-300 mb-6">
          {isOutOfCredits 
            ? "You've used all your generations. Get 100 more credits for just $9.99 to continue creating amazing travel photos!" 
            : isLowCredits 
              ? `You have ${remainingGenerations} generation${remainingGenerations === 1 ? '' : 's'} left. Stock up now with 100 more for just $9.99!`
              : "Get 100 more generations for just $9.99 and keep creating amazing travel photos!"
          }
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={onPay}
            className={`flex items-center justify-center gap-2 font-bold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 w-full sm:w-auto ${
              isOutOfCredits 
                ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white' 
                : 'bg-gradient-to-r from-fuchsia-600 to-blue-600 hover:from-fuchsia-500 hover:to-blue-500 text-white'
            }`}
            aria-label="Pay $9.99 for 100 more generations"
          >
            <CreditCardIcon className="w-5 h-5" />
            <span>Get 100 Credits - $9.99</span>
          </button>
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
            aria-label="Close dialog"
          >
            {isOutOfCredits ? 'Not Now' : 'Maybe Later'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaywallModal;