import React, { useState, useEffect } from 'react';
import { UserProfile, AppView, AnalysisResult, JournalEntry } from './types';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import AnalysisResultView from './components/AnalysisResultView';
import MyDietList from './components/MyDietList';
import DailyJournal from './components/DailyJournal';
import SettingsView from './components/SettingsView';
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

  // --- Persistence & Initialization ---
  useEffect(() => {
    const savedProfile = localStorage.getItem('canIHaveThis_user');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        // Ensure backward compatibility with new fields
        const hydratedProfile: UserProfile = {
          ...parsed,
          safeFoodList: parsed.safeFoodList || [],
          theme: parsed.theme || 'light',
          journal: parsed.journal || []
        };
        setUserProfile(hydratedProfile);
        setView(AppView.DASHBOARD);
      } catch (e) {
        console.error("Failed to parse profile", e);
        setView(AppView.INTRO);
      }
    } else {
      setView(AppView.INTRO);
    }
  }, []);

  // --- Theme Management ---
  useEffect(() => {
    if (userProfile?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [userProfile?.theme]);

  // Persist profile whenever it changes
  const saveProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('canIHaveThis_user', JSON.stringify(profile));
    if (profile.authType === 'GOOGLE' && profile.email) {
      localStorage.setItem(`canIHaveThis_user_${profile.email}`, JSON.stringify(profile));
    }
  };

  // --- Auth Handlers ---

  const handleGuestLogin = () => {
    setView(AppView.ONBOARDING);
  };

  const handleGoogleLogin = (credentialResponse: any) => {
    try {
      const decoded: any = jwtDecode(credentialResponse.credential);
      const storageKey = `canIHaveThis_user_${decoded.email}`;
      const existing = localStorage.getItem(storageKey);

      if (existing) {
        const parsed = JSON.parse(existing);
        const hydratedProfile: UserProfile = {
            ...parsed,
            safeFoodList: parsed.safeFoodList || [],
            theme: parsed.theme || 'light',
            journal: parsed.journal || []
        };
        saveProfile(hydratedProfile);
        setView(AppView.DASHBOARD);
      } else {
        const newProfilePart: Partial<UserProfile> = {
          id: decoded.sub,
          name: decoded.name,
          email: decoded.email,
          authType: 'GOOGLE'
        };
        setUserProfile(newProfilePart as UserProfile);
        setView(AppView.ONBOARDING);
      }
    } catch (e) {
      console.error("Login Error", e);
      alert("Failed to sign in with Google.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('canIHaveThis_user');
    setUserProfile(null);
    setView(AppView.INTRO);
    document.documentElement.classList.remove('dark');
  };

  // --- Core Logic Handlers ---

  const handleOnboardingComplete = async (profileData: UserProfile) => {
    // CRITICAL FIX: Prioritize the name from the form (profileData.name), NOT the google profile name.
    const finalProfile: UserProfile = {
      ...profileData,
      id: userProfile?.id || `guest-${Date.now()}`,
      authType: userProfile?.authType || 'GUEST',
      email: userProfile?.email,
      name: profileData.name, 
      safeFoodList: [],
      theme: 'light',
      journal: []
    };

    setLoadingMessage("Personalizing your avoidance list...");
    setView(AppView.LOADING);
    
    try {
        const recommendations = await generateDietaryRecommendations(finalProfile.conditions, finalProfile.allergies);
        const enhancedProfile = {
            ...finalProfile,
            generatedAvoidanceList: recommendations
        };
        saveProfile(enhancedProfile);
    } catch (e) {
        saveProfile(finalProfile);
    } finally {
        setView(AppView.DASHBOARD);
    }
  };
  
  const handleUpdateProfile = (updatedProfile: UserProfile) => {
      saveProfile(updatedProfile);
  };

  // Handle Updates to Conditions/Allergies which require AI regeneration
  const handleMedicalUpdate = async (updatedConditions: string[], updatedAllergies: string[], updatedGoals: string) => {
    if (!userProfile) return;
    
    const updatedProfile = { 
        ...userProfile, 
        conditions: updatedConditions,
        allergies: updatedAllergies,
        goals: updatedGoals
    };

    setLoadingMessage("Updating your personalized restrictions...");
    setView(AppView.LOADING);

    try {
        const recommendations = await generateDietaryRecommendations(updatedConditions, updatedAllergies);
        updatedProfile.generatedAvoidanceList = recommendations;
        saveProfile(updatedProfile);
    } catch (e) {
        console.error("Failed to regenerate recommendations", e);
        saveProfile(updatedProfile); // Save changes even if AI fails
    } finally {
        // Return to MyDiet view (or wherever called from, but usually here)
        setView(AppView.MY_DIET);
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

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const result = await analyzeFoodImage(userProfile, base64);
        setAnalysisResult(result);
        setView(AppView.RESULT);
      } catch (error) {
        alert("Could not analyze image. Ensure it's clear.");
        setView(AppView.DASHBOARD);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // --- Classification & Journaling ---

  const handleClassifyFood = (foodName: string, isSafe: boolean) => {
    if (!userProfile) return;
    const updatedProfile = { ...userProfile };
    
    if (isSafe) {
      if (!updatedProfile.safeFoodList.includes(foodName)) {
        updatedProfile.safeFoodList = [...updatedProfile.safeFoodList, foodName];
      }
      // Remove from unsafe if present
      updatedProfile.customAvoidanceList = updatedProfile.customAvoidanceList.filter(f => f !== foodName);
    } else {
      if (!updatedProfile.customAvoidanceList.includes(foodName)) {
        updatedProfile.customAvoidanceList = [...updatedProfile.customAvoidanceList, foodName];
      }
      // Remove from safe if present
      updatedProfile.safeFoodList = updatedProfile.safeFoodList.filter(f => f !== foodName);
    }
    saveProfile(updatedProfile);
  };

  const handleAddJournalEntry = (entry: JournalEntry) => {
    if (!userProfile) return;
    
    // Create a new updated profile object starting with the journal entry
    let updatedProfile = {
      ...userProfile,
      journal: [entry, ...(userProfile.journal || [])]
    };

    // Auto-classify logic
    const foodName = entry.foodName;

    if (entry.status === 'SAFE') {
      if (!updatedProfile.safeFoodList.includes(foodName)) {
        updatedProfile.safeFoodList = [...updatedProfile.safeFoodList, foodName];
      }
      updatedProfile.customAvoidanceList = updatedProfile.customAvoidanceList.filter(f => f !== foodName);
    } else if (entry.status === 'UNSAFE') {
      if (!updatedProfile.customAvoidanceList.includes(foodName)) {
        updatedProfile.customAvoidanceList = [...updatedProfile.customAvoidanceList, foodName];
      }
      updatedProfile.safeFoodList = updatedProfile.safeFoodList.filter(f => f !== foodName);
    }

    saveProfile(updatedProfile);
  };

  const handleBackToDashboard = () => {
    setAnalysisResult(null);
    setView(AppView.DASHBOARD);
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
        
        {view === AppView.INTRO && (
          <IntroAnimation onLoginGoogle={handleGoogleLogin} onLoginGuest={handleGuestLogin} />
        )}

        {view === AppView.LOADING && (
          <div className="min-h-screen flex flex-col justify-center items-center p-6 animate-fade-in">
            <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-6"></div>
            <p className="text-lg font-semibold text-slate-700 dark:text-slate-200 animate-pulse text-center">{loadingMessage}</p>
          </div>
        )}

        {view === AppView.RESULT && analysisResult && (
          <AnalysisResultView 
            result={analysisResult} 
            onBack={handleBackToDashboard}
            onClassify={handleClassifyFood} 
          />
        )}
        
        {view === AppView.MY_DIET && userProfile && (
            <MyDietList 
              user={userProfile} 
              onUpdateUser={handleUpdateProfile} 
              onMedicalUpdate={handleMedicalUpdate}
              onBack={() => setView(AppView.DASHBOARD)} 
            />
        )}

        {view === AppView.JOURNAL && userProfile && (
            <DailyJournal
              user={userProfile}
              onAddEntry={handleAddJournalEntry}
              onBack={() => setView(AppView.DASHBOARD)}
            />
        )}

        {view === AppView.SETTINGS && userProfile && (
            <SettingsView
              user={userProfile}
              onUpdateUser={handleUpdateProfile}
              onLogout={handleLogout}
              onBack={() => setView(AppView.DASHBOARD)}
            />
        )}

        {view === AppView.DASHBOARD && userProfile && (
          <Dashboard 
            user={userProfile} 
            onTextSearch={handleTextSearch}
            onImageUpload={handleImageUpload}
            onOpenDietProfile={() => setView(AppView.MY_DIET)}
            onOpenJournal={() => setView(AppView.JOURNAL)}
            onOpenSettings={() => setView(AppView.SETTINGS)}
          />
        )}

        {view === AppView.ONBOARDING && (
          <Onboarding 
            initialName={userProfile?.name} 
            onComplete={handleOnboardingComplete} 
          />
        )}
    </div>
  );
};

export default App;