import React, { useState } from 'react';
import { UserProfile } from '../types';

interface SettingsViewProps {
  user: UserProfile;
  onUpdateUser: (profile: UserProfile) => void;
  onLogout: () => void;
  onBack: () => void;
}

const AVATAR_OPTIONS = ['🐶', '🐱', '🦊', '🦁', '🐸', '🦄', '🐝', '🥑', '🥗', '🍎', '🤖', '👾'];

const SettingsView: React.FC<SettingsViewProps> = ({ user, onUpdateUser, onLogout, onBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editAvatar, setEditAvatar] = useState(user.avatar || '');

  const toggleTheme = () => {
    const newTheme = user.theme === 'dark' ? 'light' : 'dark';
    onUpdateUser({ ...user, theme: newTheme });
  };

  const handleSaveProfile = () => {
    if (editName.trim()) {
      onUpdateUser({ ...user, name: editName.trim(), avatar: editAvatar });
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditName(user.name);
    setEditAvatar(user.avatar || '');
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col animate-slide-up transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-6 shadow-sm border-b border-slate-100 dark:border-slate-700 flex items-center gap-4">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h1>
      </div>

      <div className="p-6">
        
        {/* Profile Section */}
        <div className="mb-8 flex flex-col items-center bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all">
            
            {/* Avatar Display / Selection */}
            {isEditing ? (
              <div className="mb-4 w-full">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">Choose Avatar</label>
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                   <button 
                     onClick={() => setEditAvatar('')}
                     className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${editAvatar === '' ? 'border-teal-500 bg-teal-50' : 'border-slate-200 dark:border-slate-600'}`}
                   >
                     <span className="text-sm font-bold text-slate-500">Init</span>
                   </button>
                   {AVATAR_OPTIONS.map(char => (
                     <button 
                       key={char}
                       onClick={() => setEditAvatar(char)}
                       className={`w-10 h-10 rounded-full flex items-center justify-center text-xl border-2 ${editAvatar === char ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30' : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                     >
                       {char}
                     </button>
                   ))}
                </div>
              </div>
            ) : (
              <div className="w-24 h-24 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center text-teal-700 dark:text-teal-300 text-4xl font-bold mb-3 border-4 border-white dark:border-slate-700 shadow-lg">
                  {user.avatar ? user.avatar : user.name.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Name Display / Edit */}
            {isEditing ? (
              <div className="w-full mb-4">
                 <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Display Name</label>
                 <input 
                   type="text" 
                   value={editName}
                   onChange={(e) => setEditName(e.target.value)}
                   className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:border-teal-500 text-center font-bold text-lg dark:text-white"
                 />
              </div>
            ) : (
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{user.name}</h2>
            )}

            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{user.email || 'Guest User'}</p>

            {/* Edit Actions */}
            {isEditing ? (
              <div className="flex gap-3 w-full">
                <button 
                  onClick={handleCancelEdit}
                  className="flex-1 py-2 text-slate-500 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveProfile}
                  className="flex-1 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 shadow-md"
                >
                  Save Changes
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-full text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Edit Profile
              </button>
            )}
        </div>

        {/* Options */}
        <div className="space-y-4">
            
            {/* Theme Toggle */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                        {user.theme === 'dark' 
                         ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                         : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                        }
                    </div>
                    <span className="font-medium text-slate-800 dark:text-white">Dark Mode</span>
                </div>
                <button 
                    onClick={toggleTheme}
                    className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ease-in-out ${user.theme === 'dark' ? 'bg-teal-600' : 'bg-slate-300'}`}
                >
                    <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${user.theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </button>
            </div>

            {/* Logout */}
            <button 
                onClick={onLogout}
                className="w-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-100 dark:border-red-900 font-semibold flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                Log Out
            </button>
            
            <p className="text-center text-xs text-slate-400 mt-4">SafeBite v1.1.0</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;