import React, { useState, useEffect } from 'react';
import { UserProfile, AppView, AnalysisResult } from './types';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import AnalysisResultView from './components/AnalysisResultView';
import MyDietList from './components/MyDietList';
import IntroAnimation from './components/IntroAnimation';
import { analyzeFoodImage, analyzeFoodText, generateDietaryRecommendations } from './services/geminiService';
// @ts-ignore
import { jwtDecode } from "jwt-decode";

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.INTRO);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Check for existing session on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('canIHaveThis_user');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
      setView(AppView.DASHBOARD);
    } else {
      setView(AppView.INTRO);
    }
  }, []);

  // --- Auth Handlers ---

  const handleGuestLogin = () => {
    // Guest starts fresh in onboarding
    setView(AppView.ONBOARDING);
  };

  const handleGoogleLogin = (credentialResponse: any) => {
    try {
      const decoded: any = jwtDecode(credentialResponse.credential);
      
      // Check if we have a profile saved for this email (simulated backend check)
      const storageKey = `canIHaveThis_user_${decoded.email}`;
      const existing = localStorage.getItem(storageKey);

      if (existing) {
        const profile = JSON.parse(existing);
        setUserProfile(profile);
        // Update main session key
        localStorage.setItem('canIHaveThis_user', existing);
        setView(AppView.DASHBOARD);
      } else {
        // No profile found, create a partial one and go to Onboarding
        const newProfilePart: Partial<UserProfile> = {
          id: decoded.sub,
          name: decoded.name,
          email: decoded.email,
          authType: 'GOOGLE'
        };
        // We pass this partial data into Onboarding implicitly via state or context, 
        // but for now, we'll just handle it in the completion handler.
        // To make it smoother, we could pre-fill the name in Onboarding.
        // For simplicity:
        setUserProfile(newProfilePart as UserProfile); // Temporary cast
        setView(AppView.ONBOARDING);
      }

    } catch (e) {
      console.error("Login Error", e);
      alert("Failed to sign in with Google.");
    }
  };

  // --- Core App Flow ---

  const handleOnboardingComplete = async (profileData: UserProfile) => {
    // Merge with any auth data we might have (e.g. from Google login)
    const finalProfile: UserProfile = {
      ...profileData,
      id: userProfile?.id || `guest-${Date.now()}`,
      authType: userProfile?.authType || 'GUEST',
      email: userProfile?.email,
      name: userProfile?.name || profileData.name // Prefer Google name if available
    };

    setUserProfile(finalProfile);
    setLoadingMessage("Personalizing your avoidance list...");
    setView(AppView.LOADING);
    
    // Generate AI recommendations
    try {
        const recommendations = await generateDietaryRecommendations(finalProfile.conditions, finalProfile.allergies);
        const enhancedProfile = {
            ...finalProfile,
            generatedAvoidanceList: recommendations
        };
        setUserProfile(enhancedProfile);
        
        // Save to session
        localStorage.setItem('canIHaveThis_user', JSON.stringify(enhancedProfile));
        
        // If Google User, save to their specific slot too (mock backend)
        if (enhancedProfile.authType === 'GOOGLE' && enhancedProfile.email) {
            localStorage.setItem(`canIHaveThis_user_${enhancedProfile.email}`, JSON.stringify(enhancedProfile));
        }

    } catch (e) {
        localStorage.setItem('canIHaveThis_user', JSON.stringify(finalProfile));
    } finally {
        setView(AppView.DASHBOARD);
    }
  };
  
  const handleUpdateProfile = (updatedProfile: UserProfile) => {
      setUserProfile(updatedProfile);
      localStorage.setItem('canIHaveThis_user', JSON.stringify(updatedProfile));
       // If Google User, update their specific slot
       if (updatedProfile.authType === 'GOOGLE' && updatedProfile.email) {
        localStorage.setItem(`canIHaveThis_user_${updatedProfile.email}`, JSON.stringify(updatedProfile));
      }
  };

  const handleTextSearch = async (text: string) => {
    if (!userProfile) return;
    
    setIsLoading(true);
    setLoadingMessage("Consulting dietary database...");
    setView(AppView.LOADING);

    try {
      const result = await analyzeFoodText(userProfile, text);
      setAnalysisResult(result);
      setView(AppView.RESULT);
    } catch (error) {
      alert("Something went wrong analyzing the food. Please try again.");
      setView(AppView.DASHBOARD);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!userProfile) return;

    setIsLoading(true);
    setLoadingMessage("Analyzing ingredients and safety...");
    setView(AppView.LOADING);

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const result = await analyzeFoodImage(userProfile, base64);
        setAnalysisResult(result);
        setView(AppView.RESULT);
      } catch (error) {
        alert("Could not analyze image. Ensure it's clear and contains food or text.");
        setView(AppView.DASHBOARD);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBackToDashboard = () => {
    setAnalysisResult(null);
    setView(AppView.DASHBOARD);
  };

  // --- Render Views ---

  if (view === AppView.INTRO) {
    return <IntroAnimation onLoginGoogle={handleGoogleLogin} onLoginGuest={handleGuestLogin} />;
  }

  if (view === AppView.LOADING) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 p-6 animate-fade-in">
        <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-6"></div>
        <p className="text-lg font-semibold text-slate-700 animate-pulse text-center">{loadingMessage}</p>
        <p className="text-sm text-slate-400 mt-2">Checking against your allergens...</p>
      </div>
    );
  }

  if (view === AppView.RESULT && analysisResult) {
    return <AnalysisResultView result={analysisResult} onBack={handleBackToDashboard} />;
  }
  
  if (view === AppView.MY_DIET && userProfile) {
      return (
          <MyDietList 
            user={userProfile} 
            onUpdateUser={handleUpdateProfile} 
            onBack={() => setView(AppView.DASHBOARD)} 
          />
      );
  }

  if (view === AppView.DASHBOARD && userProfile) {
    return (
      <Dashboard 
        user={userProfile} 
        onTextSearch={handleTextSearch}
        onImageUpload={handleImageUpload}
        onOpenDietProfile={() => setView(AppView.MY_DIET)}
      />
    );
  }

  if (view === AppView.ONBOARDING) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return null;
};

export default App;