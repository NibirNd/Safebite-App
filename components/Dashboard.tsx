import React, { useRef, useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface DashboardProps {
  user: UserProfile;
  onTextSearch: (text: string) => void;
  onImageUpload: (file: File) => void;
  onOpenDietProfile: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onTextSearch, onImageUpload, onOpenDietProfile }) => {
  const [query, setQuery] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // --- Camera Logic ---
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error", err);
      alert("Could not access camera. Please use the upload option instead.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
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
    return () => stopCamera();
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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6 animate-slide-up">
      
      {/* Camera Overlay */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
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
        </div>
      )}

      {/* Header */}
      <div className="w-full max-w-lg flex justify-between items-center mb-10 mt-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hello, {user.name}</h1>
          <p className="text-slate-500 text-sm">What are we eating today?</p>
        </div>
        <div className="flex gap-3 items-center">
            <button 
                onClick={onOpenDietProfile}
                className="text-sm font-semibold text-teal-700 bg-teal-50 px-3 py-2 rounded-lg hover:bg-teal-100 transition-colors"
            >
                My Diet
            </button>
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold border-2 border-teal-200">
            {user.name.charAt(0).toUpperCase()}
            </div>
        </div>
      </div>

      {/* Main Action Area */}
      <div className="w-full max-w-lg space-y-6">
        
        {/* Search Box */}
        <form onSubmit={handleSearchSubmit} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-2">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search food (e.g., 'Croissant')"
            className="flex-1 bg-transparent outline-none text-slate-800 placeholder-slate-400"
          />
          <button type="submit" className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
        </form>

        <div className="flex items-center justify-center gap-4 text-slate-400 text-sm">
          <div className="h-px bg-slate-200 flex-1"></div>
          OR
          <div className="h-px bg-slate-200 flex-1"></div>
        </div>

        {/* Live Camera Button */}
        <button 
          onClick={() => setIsCameraOpen(true)}
          className="w-full bg-teal-600 text-white h-48 rounded-3xl flex flex-col items-center justify-center gap-4 shadow-lg shadow-teal-100 hover:bg-teal-700 transition-all active:scale-[0.98]"
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
             className="text-teal-600 text-sm font-medium hover:underline"
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

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-4 pt-4">
            <div 
              onClick={onOpenDietProfile}
              className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 cursor-pointer active:scale-95 transition-transform"
            >
                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Conditions</h3>
                <div className="flex flex-wrap gap-1">
                    {user.conditions.length > 0 ? user.conditions.slice(0, 3).map(c => (
                        <span key={c} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{c}</span>
                    )) : <span className="text-xs text-slate-400">None</span>}
                </div>
            </div>
            <div 
               onClick={onOpenDietProfile}
               className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 cursor-pointer active:scale-95 transition-transform"
            >
                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Avoid List</h3>
                <div className="flex flex-wrap gap-1">
                    {/* Combine lists for preview */}
                    {[...user.allergies, ...user.customAvoidanceList, ...user.generatedAvoidanceList].length > 0 ? 
                        [...user.allergies, ...user.customAvoidanceList, ...user.generatedAvoidanceList].slice(0, 3).map((a, i) => (
                        <span key={i} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded">{a}</span>
                    )) : <span className="text-xs text-slate-400">None</span>}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;