import React, { useState, useCallback, useEffect } from 'react';
import type { ImageData, User } from './types';
import { getMe, generateImage, logout } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import LoadingOverlay from './components/LoadingOverlay';
import HelpModal from './components/HelpModal';
import PaywallModal from './components/PaywallModal';
import { UserIcon, LocationIcon, SparklesIcon, ArrowPathIcon, DownloadIcon, ShareIcon, QuestionMarkCircleIcon, LogoutIcon } from './components/icons';
import LoginScreen from './components/LoginScreen';

const App: React.FC = () => {
  const [selfie, setSelfie] = useState<ImageData | null>(null);
  const [location, setLocation] = useState<ImageData | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [resultText, setResultText] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [locationInputMode, setLocationInputMode] = useState<'upload' | 'prompt'>('prompt');
  const [locationPrompt, setLocationPrompt] = useState<string>('');
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showPaywallModal, setShowPaywallModal] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState<boolean>(false);

  const fetchUser = useCallback(async () => {
    try {
        const data = await getMe();
        setUser(data?.user ?? null);
    } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(null);
    } finally {
        setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleSelfieSelect = useCallback((imageData: ImageData) => setSelfie(imageData), []);
  const handleLocationSelect = useCallback((imageData: ImageData) => setLocation(imageData), []);

  const handleGenerate = async () => {
    if (!user || user.remainingGenerations <= 0) {
        setShowPaywallModal(true);
        return;
    }

    if (!selfie) {
      setError('Please upload a selfie.');
      return;
    }

    let locationInput: ImageData | string | null = null;

    if (locationInputMode === 'prompt') {
      if (!locationPrompt.trim()) {
        setError('Please enter a description for the location.');
        return;
      }
      locationInput = locationPrompt;
    } else {
      if (!location) {
        setError('Please upload a location photo.');
        return;
      }
      locationInput = location;
    }

    setError(null);
    setLoading(true);
    setResultImage(null);
    setResultText(null);
    
    try {
      const result = await generateImage(locationInput, selfie);
      setResultImage(result.image);
      setResultText(result.text);

      setUser(prevUser => prevUser ? { ...prevUser, remainingGenerations: result.remainingGenerations } : null);

    } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unexpected error occurred.');
        }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelfie(null);
    setLocation(null);
    setResultImage(null);
    setResultText(null);
    setError(null);
    setLoading(false);
    setLocationPrompt('');
    setLocationInputMode('upload');
  };

  const handleLogout = async () => {
    try {
        await logout();
    } catch (error) {
        console.error("Logout failed:", error);
    } finally {
        handleReset();
        setUser(null);
    }
  };

  const handleDownload = async () => {
    if (!resultImage) return;
    
    try {
      // Convert data URL to blob for better iOS compatibility
      const response = await fetch(resultImage);
      const blob = await response.blob();
      
      // Check if we're on iOS/Safari
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      
      if (isIOS || isSafari) {
        // For iOS/Safari, open in new tab as fallback
        const url = URL.createObjectURL(blob);
        const newWindow = window.open(url, '_blank');
        if (newWindow) {
          // Provide user instruction
          setTimeout(() => {
            alert('To save the image: Press and hold the image, then select "Save to Photos" or "Download Image"');
          }, 500);
        } else {
          // If popup blocked, try direct download
          const link = document.createElement('a');
          link.href = url;
          link.download = 'couch-influencer.png';
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      } else {
        // For other browsers, use standard download approach
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'couch-influencer.png';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to original method
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = 'couch-influencer.png';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = async () => {
    if (!resultImage) return;

    try {
      const response = await fetch(resultImage);
      const blob = await response.blob();
      const file = new File([blob], 'couch-influencer.png', { type: blob.type });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My AI Travel Photo!',
          text: 'Check out this photo I created with Couch Influencer.',
        });
      } else {
        alert('Sharing is not supported on your browser.');
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
      console.error('Error sharing:', error);
      alert('An error occurred while trying to share the image.');
    }
  };

  const handlePayment = async () => {
    try {
      const response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: 'UNLOCK_100_GENERATIONS' }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create checkout session' }));
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { checkoutUrl } = await response.json();
      window.location.href = checkoutUrl; // Redirect to Stripe checkout
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to initiate payment. Please try again.');
      setShowPaywallModal(false);
    }
  };

  if (!authChecked) {
    return <div className="min-h-screen bg-gray-900" aria-busy="true"></div>; // Render a blank loading screen
  }

  if (!user) {
    return <LoginScreen onLogin={fetchUser} />;
  }
  
  const isShareSupported = typeof navigator.share === 'function' && typeof navigator.canShare === 'function';
  const isReady = selfie && (location || (locationInputMode === 'prompt' && locationPrompt.trim() !== ''));
  const remainingGenerations = user.remainingGenerations;
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans relative overflow-x-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-fuchsia-900/40"></div>

      <header className="sticky top-0 z-20 backdrop-blur bg-gray-900/80 border-b border-gray-800">
        <div className="max-w-5xl mx-auto flex items-center justify-between p-4 sm:p-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 to-cyan-400">
            Couch Influencer
          </h1>
          <div className="flex items-center gap-4">
            <img src={user.picture} alt={user.name} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-fuchsia-500/50" referrerPolicy="no-referrer" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-fuchsia-500 rounded-lg p-2"
              aria-label="Logout"
            >
              <LogoutIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pb-8">
        <p className="text-center mt-6 mb-8 text-sm sm:text-base md:text-lg text-gray-400">
          Create your dream travel photos without leaving home.
        </p>

        {/* Credits Display */}
        <div className={`backdrop-blur-sm border rounded-xl p-4 mb-6 flex justify-between items-center transition-all duration-300 ${
            remainingGenerations === 0
                ? 'bg-red-900/20 border-red-500/50 shadow-lg shadow-red-500/10'
                : remainingGenerations <= 2
                    ? 'bg-amber-900/20 border-amber-500/50 shadow-lg shadow-amber-500/10'
                    : 'bg-gray-800/30 border-gray-700/50'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
                remainingGenerations === 0
                    ? 'bg-red-500/20'
                    : remainingGenerations <= 2
                        ? 'bg-amber-500/20'
                        : 'bg-fuchsia-500/20'
            }`}>
              <SparklesIcon className={`w-6 h-6 ${
                  remainingGenerations === 0
                      ? 'text-red-400'
                      : remainingGenerations <= 2
                          ? 'text-amber-400'
                          : 'text-fuchsia-400'
              }`} />
            </div>
            <div>
              <span className="text-lg font-semibold text-white">
                {remainingGenerations} generation{remainingGenerations === 1 ? '' : 's'} remaining
              </span>
              {remainingGenerations === 0 && (
                <p className="text-sm text-red-300">Get more to continue creating!</p>
              )}
              {remainingGenerations > 0 && remainingGenerations <= 2 && (
                <p className="text-sm text-amber-300">Running low! Consider getting more.</p>
              )}
              {remainingGenerations > 2 && (
                <p className="text-sm text-gray-400">Ready to create amazing photos!</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowPaywallModal(true)}
            className={`flex items-center gap-2 font-semibold py-2 px-4 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 text-sm ${
                remainingGenerations === 0
                    ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white animate-pulse'
                    : 'bg-gradient-to-r from-fuchsia-600 to-blue-600 hover:from-fuchsia-500 hover:to-blue-500 text-white'
            }`}
          >
            <SparklesIcon className="w-4 h-4" />
            <span>{remainingGenerations === 0 ? 'Get Credits' : 'Buy More Credits'}</span>
          </button>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl shadow-black/30 p-6 sm:p-8">
          {loading && <LoadingOverlay />}

          {!resultImage ? (
             <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-8 max-w-2xl mx-auto w-full">
                    <div>
                        <div className="flex justify-center items-center gap-2 mb-4">
                            <h3 className="text-xl font-semibold text-gray-200">1. Upload Your Selfie</h3>
                            <button
                                onClick={() => setShowHelpModal(true)}
                                className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-fuchsia-500 rounded-full"
                                aria-label="Selfie tips"
                            >
                                <QuestionMarkCircleIcon className="w-6 h-6 text-gray-400 hover:text-fuchsia-400 transition-colors"/>
                            </button>
                        </div>
                        <ImageUploader
                            title=""
                            icon={<UserIcon className="w-full h-full text-gray-600"/>}
                            onImageSelect={handleSelfieSelect}
                            imageData={selfie}
                        />
                    </div>
                    <div className="w-full flex flex-col">
                        <h3 className="text-xl font-semibold text-gray-200 mb-4 text-center">2. Choose a Location</h3>
                        <div className="flex mb-4 rounded-lg bg-gray-700/50 p-1 self-center">
                            <button
                                onClick={() => setLocationInputMode('upload')}
                                className={`w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${locationInputMode === 'upload' ? 'bg-fuchsia-600 text-white shadow' : 'text-gray-300 hover:bg-gray-600/50'}`}
                                aria-pressed={locationInputMode === 'upload'}
                            >
                                Upload Image
                            </button>
                            <button
                                onClick={() => setLocationInputMode('prompt')}
                                className={`w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${locationInputMode === 'prompt' ? 'bg-fuchsia-600 text-white shadow' : 'text-gray-300 hover:bg-gray-600/50'}`}
                                aria-pressed={locationInputMode === 'prompt'}
                            >
                                From Text
                            </button>
                        </div>
                        <div className="flex-grow">
                        {locationInputMode === 'upload' ? (
                            <ImageUploader
                                title=""
                                icon={<LocationIcon className="w-16 h-16 text-gray-600" />}
                                onImageSelect={handleLocationSelect}
                                imageData={location}
                            />
                        ) : (
                            <textarea
                                value={locationPrompt}
                                onChange={(e) => setLocationPrompt(e.target.value)}
                                placeholder="e.g., A beautiful beach in Bali at sunset, photorealistic."
                                className="w-full h-64 rounded-xl border-2 border-dashed border-gray-600 bg-white/5 p-4 text-gray-200 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 hover:border-fuchsia-500 transition-all duration-300"
                                aria-label="Location text prompt"
                            />
                        )}
                        </div>
                    </div>
                </div>

                {error && <div className="text-center bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg">{error}</div>}

                <div className="mt-4 flex flex-col items-center gap-3">
                    <button
                        onClick={handleGenerate}
                        disabled={!isReady || loading}
                        className="flex items-center gap-3 bg-gradient-to-r from-fuchsia-600 to-blue-600 hover:from-fuchsia-500 hover:to-blue-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        <SparklesIcon className="w-6 h-6"/>
                        <span>Generate Image</span>
                    </button>
                </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
                <h2 className="text-3xl font-bold text-center">Your Trip is Ready!</h2>
                <div className="w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl shadow-black/50 border-2 border-fuchsia-500">
                    <img src={resultImage} alt="Generated influencer" className="w-full h-auto object-contain" />
                </div>
                {resultText && (
                    <div className="w-full max-w-2xl bg-white/5 p-4 rounded-lg border border-gray-700">
                        <p className="text-gray-300 italic">{resultText}</p>
                    </div>
                )}
                <div className="flex flex-col items-center gap-4 mt-4">
                    <div className="flex flex-wrap justify-center gap-4">
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
                            aria-label="Download image"
                        >
                            <DownloadIcon className="w-5 h-5"/>
                            <span>Download</span>
                        </button>
                        <button
                            onClick={handleShare}
                            disabled={!isShareSupported}
                            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                            aria-label="Share image"
                        >
                            <ShareIcon className="w-5 h-5"/>
                            <span>Share</span>
                        </button>
                    </div>
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-3 bg-gradient-to-r from-fuchsia-600 to-blue-600 hover:from-fuchsia-500 hover:to-blue-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
                    >
                        <ArrowPathIcon className="w-6 h-6"/>
                        <span>Create Another</span>
                    </button>
                </div>
            </div>
          )}
        </div>
      </main>

      <footer className="relative z-10 text-center py-8 text-gray-500">
        <p>Powered by Gemini AI</p>
      </footer>

      <HelpModal show={showHelpModal} onClose={() => setShowHelpModal(false)} />
      <PaywallModal
        show={showPaywallModal}
        onClose={() => setShowPaywallModal(false)}
        onPay={handlePayment}
        remainingGenerations={remainingGenerations}
      />
    </div>
  );
};

export default App;
