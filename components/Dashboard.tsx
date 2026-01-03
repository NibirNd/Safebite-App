import React, { useRef, useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface DashboardProps {
  user: UserProfile;
  onTextSearch: (text: string) => void;
  onImageUpload: (file: File) => void;
  onOpenDietProfile: () => void;
  onOpenJournal: () => void;
  onOpenSettings: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onTextSearch, onImageUpload, onOpenDietProfile, onOpenJournal, onOpenSettings }) => {
  const [query, setQuery] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // --- Camera Logic ---
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera error", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError("Permission denied. Please enable camera access in your browser settings and try again.");
      } else if (err.name === 'NotFoundError') {
        setCameraError("No camera device found on this device.");
      } else {
        setCameraError("Unable to access camera. Please try using the upload button instead.");
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
    setCameraError(null);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
            stopCamera();
            onImageUpload(file);
          }
        }, 'image/jpeg');
      }
    }
  };

  useEffect(() => {
    if (isCameraOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOpen]);
  // --------------------

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onTextSearch(query);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center p-6 animate-slide-up transition-colors duration-300">
      
      {/* Camera Overlay */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
          
          {cameraError ? (
            <div className="p-8 text-center max-w-sm">
                <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                     <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M19.69 14a6.9 6.9 0 0 0 .31-2c0-3.87-3.13-7-7-7-1.5 0-2.86.6-3.9 1.64"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path><path d="M20 22a2 2 0 0 1-2-2"></path><path d="M4.93 19.07a10 10 0 0 1-1.93-7.07c0-5.52 4.48-10 10-10"></path></svg>
                </div>
                <h3 className="text-white font-bold text-xl mb-2">Camera Error</h3>
                <p className="text-slate-400 mb-6">{cameraError}</p>
                <button 
                  onClick={() => setIsCameraOpen(false)}
                  className="bg-slate-800 text-white px-6 py-3 rounded-full font-semibold border border-slate-700"
                >
                  Close
                </button>
            </div>
          ) : (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4">
                <button 
                  onClick={() => setIsCameraOpen(false)}
                  className="bg-black/50 text-white p-2 rounded-full backdrop-blur-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              <div className="absolute bottom-8 w-full flex justify-center">
                <button 
                  onClick={capturePhoto}
                  className="w-20 h-20 bg-white rounded-full border-4 border-teal-500 shadow-lg flex items-center justify-center active:scale-95 transition-transform"
                >
                  <div className="w-16 h-16 bg-white rounded-full border-2 border-black/10"></div>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Header */}
      <div className="w-full max-w-lg flex justify-between items-center mb-10 mt-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Hello, {user.name}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">What are we eating today?</p>
        </div>
        <div className="flex gap-2 items-center">
             <button 
                onClick={onOpenSettings}
                className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                title="Settings"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            </button>
            <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold border-2 border-teal-200 dark:border-teal-800">
            {user.name.charAt(0).toUpperCase()}
            </div>
        </div>
      </div>

      {/* Main Action Area */}
      <div className="w-full max-w-lg space-y-6">
        
        {/* Search Box */}
        <form onSubmit={handleSearchSubmit} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex gap-2">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search food (e.g., 'Croissant')"
            className="flex-1 bg-transparent outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400"
          />
          <button type="submit" className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 dark:text-slate-300"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
        </form>

        <div className="flex items-center justify-center gap-4 text-slate-400 text-sm">
          <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
          OR
          <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
        </div>

        {/* Live Camera Button */}
        <button 
          onClick={() => setIsCameraOpen(true)}
          className="w-full bg-teal-600 dark:bg-teal-700 text-white h-48 rounded-3xl flex flex-col items-center justify-center gap-4 shadow-lg shadow-teal-100 dark:shadow-none hover:bg-teal-700 dark:hover:bg-teal-600 transition-all active:scale-[0.98]"
        >
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
          </div>
          <div className="text-center">
            <span className="block text-xl font-semibold">Scan Food / Label</span>
            <span className="text-teal-100 text-sm">Use your camera</span>
          </div>
        </button>

        {/* Upload from Gallery (Fallback) */}
        <div className="text-center">
           <button 
             onClick={() => fileInputRef.current?.click()} 
             className="text-teal-600 dark:text-teal-400 text-sm font-medium hover:underline"
           >
             Or upload from gallery
           </button>
        </div>
        
        {/* Hidden File Input */}
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden" 
        />

        {/* Info Cards Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4">
            <button 
              onClick={onOpenDietProfile}
              className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 active:scale-95 transition-transform text-left"
            >
                <div className="flex justify-between items-start mb-2">
                   <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">My Diet</h3>
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-500"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                </div>
                <div className="flex flex-wrap gap-1">
                    {user.conditions.length > 0 ? user.conditions.slice(0, 2).map(c => (
                        <span key={c} className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">{c}</span>
                    )) : <span className="text-xs text-slate-400">None</span>}
                </div>
            </button>

            <button 
               onClick={onOpenJournal}
               className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 active:scale-95 transition-transform text-left"
            >
                <div className="flex justify-between items-start mb-2">
                   <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Journal</h3>
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-500"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300">
                    {user.journal.length} Entries Logged
                </div>
            </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;