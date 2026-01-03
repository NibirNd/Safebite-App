import React, { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    google: any;
  }
}

interface IntroAnimationProps {
  onLoginGoogle: (credentialResponse: any) => void;
  onLoginGuest: () => void;
}

const IntroAnimation: React.FC<IntroAnimationProps> = ({ onLoginGoogle, onLoginGuest }) => {
  const [stage, setStage] = useState(0);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Helper to get Client ID from various environment configurations
  const getClientId = () => {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      // @ts-ignore
      return import.meta.env.VITE_GOOGLE_CLIENT_ID;
    }
    return process.env.GOOGLE_CLIENT_ID;
  };

  const DEFAULT_CLIENT_ID = "612336816998-a9tkiguq245i373asne6op7f7g7iiqg1.apps.googleusercontent.com";
  // Use the provided Client ID or fallback to the hardcoded one
  const rawClientId = getClientId() || DEFAULT_CLIENT_ID;
  const isGoogleConfigured = rawClientId && rawClientId.length > 0;
  const isDefaultId = rawClientId === DEFAULT_CLIENT_ID;

  // Animation Timeline
  useEffect(() => {
    // Enhanced Debugging for Origin Mismatch
    console.group("🔐 SafeBite Auth Configuration");
    console.log("Current Origin:", window.location.origin);
    console.log("Active Client ID:", rawClientId);
    
    if (isDefaultId) {
        console.warn("%c⚠️ USING DEMO CLIENT ID", "color: orange; font-weight: bold; font-size: 12px;");
        console.warn("You are using the default demo Client ID. This ID DOES NOT authorize '" + window.location.origin + "'.");
        console.warn("To fix 'Error 400: origin_mismatch':");
        console.warn("1. Create a Google Cloud Project.");
        console.warn("2. Create a generic OAuth Client ID.");
        console.warn("3. Add '" + window.location.origin + "' to Authorized Javascript Origins.");
        console.warn("4. Set VITE_GOOGLE_CLIENT_ID in your environment variables (e.g., .env.local or Vercel Settings) to your NEW Client ID.");
    } else {
        console.log("✅ Using Custom Client ID. Ensure '" + window.location.origin + "' is added to this Client ID in Google Cloud Console.");
    }
    console.groupEnd();

    // 0s: "Does this contain Gluten?"
    const t1 = setTimeout(() => setStage(1), 2500); // 2.5s: "Is it safe for my IBS?"
    const t2 = setTimeout(() => setStage(2), 5000); // 5.0s: "Stop Guessing."
    const t3 = setTimeout(() => setStage(3), 7000); // 7.0s: Final Reveal

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [rawClientId, isDefaultId]);

  // Initialize Google Button when we reach the final stage
  useEffect(() => {
    if (stage === 3 && window.google && isGoogleConfigured) {
      try {
        window.google.accounts.id.initialize({
          client_id: rawClientId,
          callback: onLoginGoogle,
          auto_select: false,
          cancel_on_tap_outside: true
        });
        
        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(
            googleBtnRef.current,
            { theme: "outline", size: "large", type: "standard", shape: "pill", width: 280 }
          );
        }
      } catch (e) {
        console.error("Google Sign-In initialization failed", e);
      }
    }
  }, [stage, onLoginGoogle, isGoogleConfigured, rawClientId]);

  // Stage 0-2: The Problem (Dark Mode)
  if (stage < 3) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center p-6 z-50">
        {stage === 0 && (
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter text-center animate-cinematic-text">
            Does this contain <span className="text-red-500">Gluten?</span>
          </h1>
        )}
        {stage === 1 && (
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter text-center animate-cinematic-text">
            Is it safe for my <span className="text-amber-500">IBS?</span>
          </h1>
        )}
        {stage === 2 && (
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter text-center animate-cinematic-text">
            Stop <span className="text-slate-500">Guessing.</span>
          </h1>
        )}
      </div>
    );
  }

  // Stage 3: The Solution (Light Mode / Reveal)
  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-between p-8 z-40 animate-fade-in overflow-y-auto">
      
      {/* Top Content */}
      <div className="mt-10 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-teal-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-teal-200 rotate-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        
        <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-2">
          SafeBite.
        </h1>
        <p className="text-slate-500 text-lg font-medium max-w-xs">
          Your personal AI food detective.
        </p>
      </div>

      {/* Auth Actions */}
      <div className="w-full max-w-sm flex flex-col items-center gap-4 mb-4">
        
        {/* Google Container */}
        <div className="min-h-[44px] w-full flex justify-center" ref={googleBtnRef}>
           {/* Fallback if configuration is missing */}
           {!isGoogleConfigured && (
             <div className="text-center text-sm text-red-500 p-2 border border-red-200 rounded bg-red-50">
               Google Client ID is missing.
             </div>
           )}
           {isDefaultId && window.location.hostname !== 'localhost' && (
               <div className="text-center text-[10px] text-amber-600 p-2 bg-amber-50 border border-amber-100 rounded mt-2">
                   Configuration Error: You are using the default Demo ID on a production URL. 
                   Google Sign-In will fail. Please set VITE_GOOGLE_CLIENT_ID.
               </div>
           )}
        </div>

        <div className="flex items-center w-full gap-2">
           <div className="h-px bg-slate-200 flex-1"></div>
           <span className="text-xs text-slate-400 font-bold uppercase">Or</span>
           <div className="h-px bg-slate-200 flex-1"></div>
        </div>

        <button 
          onClick={onLoginGuest}
          className="w-full py-3.5 rounded-full border-2 border-slate-200 text-slate-700 font-bold hover:bg-white hover:border-slate-300 transition-all active:scale-95 shadow-sm"
        >
          Continue as Guest
        </button>

        <p className="text-[10px] text-slate-400 text-center mt-4 px-6 leading-relaxed">
          By continuing, you agree to our Terms of Service. 
          SafeBite uses AI and may make mistakes. Always consult a medical professional.
        </p>
      </div>

      {/* Footer */}
      <div className="w-full text-center pb-2">
         <p className="text-[10px] text-slate-300 font-medium tracking-wide uppercase">
            Developed by ND
         </p>
      </div>

    </div>
  );
};

export default IntroAnimation;