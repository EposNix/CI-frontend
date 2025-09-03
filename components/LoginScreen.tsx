import React, { useEffect, useRef, useState } from 'react';
import { login } from '../services/geminiService';
import BeforeAfterCarousel from './BeforeAfterCarousel';
import TrustRow from './TrustRow';
import OutcomeRow from './OutcomeRow';

// TypeScript declaration for the google object from the GSI script
declare const google: any;

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const signInButton = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  const carouselItems = [
    { before: '', after: '', label: 'Example 1' },
    { before: '', after: '', label: 'Example 2' },
    { before: '', after: '', label: 'Example 3' },
    { before: '', after: '', label: 'Example 4' },
    { before: '', after: '', label: 'Example 5' },
    { before: '', after: '', label: 'Example 6' }
  ];

  useEffect(() => {
    // Check if the google object is available from the script loaded in index.html
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: "972097381999-3v1uvnc92h3ncam09oi9jmeoj9228ccs.apps.googleusercontent.com",
        callback: async (response: any) => {
          try {
            setError(null);
            await login(response.credential);
            onLogin();
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
          }
        }
      });

      if (signInButton.current) {
        google.accounts.id.renderButton(
          signInButton.current,
          { theme: "outline", size: "large", text: "signin_with", width: "320", logo_alignment: "left" }
        );
      }
      
    } else {
      console.error("Google Identity Services script not loaded");
    }
  }, [onLogin]);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col overflow-hidden">
      <section className="relative w-full h-[60vh] sm:h-[70vh]">
        <BeforeAfterCarousel items={carouselItems} />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-fuchsia-900/60"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 to-cyan-400">
            Couch Influencer
          </h1>
          <p className="mt-3 text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
            Create your dream travel photos without leaving home.
          </p>
          <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl shadow-black/30 p-8 sm:p-10 mt-8 w-full max-w-md">
            <h2 className="text-2xl font-semibold text-gray-100 mb-4">Welcome Back!</h2>
            <p className="text-gray-400 mb-8">
              Ready to explore the world from your couch? Sign in to continue your journey.
            </p>
            {error && (
              <div className="text-center bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            <div ref={signInButton} className="flex justify-center"></div>
          </div>
        </div>
      </section>
      <TrustRow />
      <OutcomeRow />
      <footer className="text-center py-8 text-gray-500">Powered by Gemini AI</footer>
    </div>
  );
};

export default LoginScreen;
