import React, { useEffect, useRef, useState } from 'react';
import { login } from '../services/geminiService';
import { GoogleIcon } from './icons';

// TypeScript declaration for the google object from the GSI script
declare const google: any;

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const signInButton = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

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
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900 via-gray-900 to-fuchsia-900/40 z-0"></div>
      <div className="w-full max-w-md mx-auto z-10 text-center">
        <header className="my-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 to-cyan-400">
                Couch Influencer
            </h1>
            <p className="mt-3 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
                Create your dream travel photos without leaving home.
            </p>
        </header>

        <main className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl shadow-black/30 p-8 sm:p-10">
            <h2 className="text-2xl font-semibold text-gray-100 mb-4">Welcome Back!</h2>
            <p className="text-gray-400 mb-8">
                Ready to explore the world from your couch? Sign in to continue your journey.
            </p>
            {error && <div className="text-center bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg mb-4">{error}</div>}
            {/* The Google Sign-In button will be rendered into this div */}
            <div ref={signInButton} className="flex justify-center"></div>
        </main>
        <footer className="mt-12 text-gray-500">
            <p>Powered by Gemini AI</p>
        </footer>
      </div>
    </div>
  );
};

export default LoginScreen;
