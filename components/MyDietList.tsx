import React, { useState } from 'react';
import { UserProfile } from '../types';

interface MyDietListProps {
  user: UserProfile;
  onUpdateUser: (updatedProfile: UserProfile) => void;
  onBack: () => void;
}

const MyDietList: React.FC<MyDietListProps> = ({ user, onUpdateUser, onBack }) => {
  const [activeTab, setActiveTab] = useState<'SAFE' | 'UNSAFE'>('UNSAFE');
  const [newItem, setNewItem] = useState('');

  const handleAddItem = () => {
    if (!newItem.trim()) return;
    
    const val = newItem.trim();
    const updated = { ...user };
    
    if (activeTab === 'SAFE') {
        updated.safeFoodList = [...updated.safeFoodList, val];
    } else {
        updated.customAvoidanceList = [...updated.customAvoidanceList, val];
    }
    
    onUpdateUser(updated);
    setNewItem('');
  };

  const handleRemoveItem = (item: string, listType: 'SAFE' | 'CUSTOM_AVOID' | 'GEN_AVOID') => {
    const updated = { ...user };
    
    if (listType === 'SAFE') {
        updated.safeFoodList = updated.safeFoodList.filter(i => i !== item);
    } else if (listType === 'CUSTOM_AVOID') {
        updated.customAvoidanceList = updated.customAvoidanceList.filter(i => i !== item);
    } else {
        updated.generatedAvoidanceList = updated.generatedAvoidanceList.filter(i => i !== item);
    }
    onUpdateUser(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col animate-slide-up transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-6 shadow-sm border-b border-slate-100 dark:border-slate-700 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">My Dietary Profile</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <button 
          onClick={() => setActiveTab('UNSAFE')}
          className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'UNSAFE' ? 'border-red-500 text-red-600 dark:text-red-400' : 'border-transparent text-slate-500 dark:text-slate-400'}`}
        >
          Unsafe List
        </button>
        <button 
          onClick={() => setActiveTab('SAFE')}
          className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'SAFE' ? 'border-green-500 text-green-600 dark:text-green-400' : 'border-transparent text-slate-500 dark:text-slate-400'}`}
        >
          Safe List
        </button>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 overflow-y-auto">
        
        {/* Add New */}
        <div className="flex gap-2 mb-6">
            <input 
            type="text" 
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder={`Add to ${activeTab === 'SAFE' ? 'Safe' : 'Unsafe'} list...`}
            className={`flex-1 p-3 bg-white dark:bg-slate-800 border rounded-lg outline-none transition-colors text-slate-800 dark:text-white ${activeTab === 'SAFE' ? 'border-slate-300 dark:border-slate-600 focus:border-green-500' : 'border-slate-300 dark:border-slate-600 focus:border-red-500'}`}
            />
            <button 
            onClick={handleAddItem}
            disabled={!newItem.trim()}
            className={`text-white px-4 rounded-lg font-semibold disabled:opacity-50 ${activeTab === 'SAFE' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
            >
            Add
            </button>
        </div>

        {activeTab === 'UNSAFE' && (
          <div className="space-y-4">
              {/* Custom Items */}
              {user.customAvoidanceList.length > 0 && (
                <div>
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">My Unsafe Foods</h3>
                   <div className="space-y-2">
                     {user.customAvoidanceList.map((item, idx) => (
                       <div key={`custom-${idx}`} className="flex justify-between items-center bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                         <span className="font-medium text-slate-700 dark:text-slate-200">{item}</span>
                         <button onClick={() => handleRemoveItem(item, 'CUSTOM_AVOID')} className="text-slate-400 hover:text-red-500">
                           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                         </button>
                       </div>
                     ))}
                   </div>
                </div>
              )}

              {/* Generated/Inferred */}
              {user.generatedAvoidanceList.length > 0 && (
                <div className="mt-6">
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">AI Recommended Avoidances</h3>
                   <div className="space-y-2">
                     {user.generatedAvoidanceList.map((item, idx) => (
                       <div key={`gen-${idx}`} className="flex justify-between items-center bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                         <span className="font-medium text-slate-700 dark:text-slate-300">{item}</span>
                         <button onClick={() => handleRemoveItem(item, 'GEN_AVOID')} className="text-slate-400 hover:text-red-500" title="Remove recommendation">
                           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                         </button>
                       </div>
                     ))}
                   </div>
                </div>
              )}
          </div>
        )}

        {activeTab === 'SAFE' && (
          <div className="space-y-4">
             {user.safeFoodList.length > 0 ? (
                 <div className="space-y-2">
                     {user.safeFoodList.map((item, idx) => (
                       <div key={`safe-${idx}`} className="flex justify-between items-center bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-900">
                         <span className="font-medium text-green-800 dark:text-green-300">{item}</span>
                         <button onClick={() => handleRemoveItem(item, 'SAFE')} className="text-slate-400 hover:text-red-500">
                           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                         </button>
                       </div>
                     ))}
                 </div>
             ) : (
                 <div className="text-center text-slate-400 italic mt-10">
                     No foods marked as safe yet.
                 </div>
             )}
          </div>
        )}

      </div>
    </div>
  );
};

export default MyDietList;