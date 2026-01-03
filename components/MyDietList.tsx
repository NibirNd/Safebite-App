import React, { useState } from 'react';
import { UserProfile } from '../types';

interface MyDietListProps {
  user: UserProfile;
  onUpdateUser: (updatedProfile: UserProfile) => void;
  onBack: () => void;
}

const MyDietList: React.FC<MyDietListProps> = ({ user, onUpdateUser, onBack }) => {
  const [activeTab, setActiveTab] = useState<'CONDITIONS' | 'AVOID'>('AVOID');
  const [newAvoidItem, setNewAvoidItem] = useState('');

  const handleAddAvoidItem = () => {
    if (newAvoidItem.trim()) {
      const updatedProfile = {
        ...user,
        customAvoidanceList: [...user.customAvoidanceList, newAvoidItem.trim()]
      };
      onUpdateUser(updatedProfile);
      setNewAvoidItem('');
    }
  };

  const handleRemoveAvoidItem = (item: string, isCustom: boolean) => {
    if (isCustom) {
      const updatedProfile = {
        ...user,
        customAvoidanceList: user.customAvoidanceList.filter(i => i !== item)
      };
      onUpdateUser(updatedProfile);
    } else {
        // We can allow removing generated items by filtering them out, 
        // effectively treating them as 'ignored' for this session or removing from the list array
        const updatedProfile = {
            ...user,
            generatedAvoidanceList: user.generatedAvoidanceList.filter(i => i !== item)
        };
        onUpdateUser(updatedProfile);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col animate-slide-up">
      {/* Header */}
      <div className="bg-white p-6 shadow-sm border-b border-slate-100 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h1 className="text-xl font-bold text-slate-900">My Dietary Profile</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white">
        <button 
          onClick={() => setActiveTab('AVOID')}
          className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'AVOID' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500'}`}
        >
          Ingredients to Avoid
        </button>
        <button 
          onClick={() => setActiveTab('CONDITIONS')}
          className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'CONDITIONS' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500'}`}
        >
          Conditions & Goals
        </button>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 overflow-y-auto">
        
        {activeTab === 'AVOID' && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
              <p>
                <strong>Personalized Diary:</strong> This list combines ingredients you explicitly selected and ones we inferred from your conditions (e.g., IBS → Garlic).
                The AI uses this list when scanning food.
              </p>
            </div>

            {/* Add New */}
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newAvoidItem}
                onChange={(e) => setNewAvoidItem(e.target.value)}
                placeholder="Add ingredient to avoid..."
                className="flex-1 p-3 border border-slate-300 rounded-lg outline-none focus:border-red-500 transition-colors"
              />
              <button 
                onClick={handleAddAvoidItem}
                disabled={!newAvoidItem.trim()}
                className="bg-red-600 text-white px-4 rounded-lg font-semibold disabled:opacity-50"
              >
                Add
              </button>
            </div>

            <div className="space-y-4">
              {/* Custom Items */}
              {user.customAvoidanceList.length > 0 && (
                <div>
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Manually Added</h3>
                   <div className="space-y-2">
                     {user.customAvoidanceList.map((item, idx) => (
                       <div key={`custom-${idx}`} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                         <span className="font-medium text-slate-700">{item}</span>
                         <button onClick={() => handleRemoveAvoidItem(item, true)} className="text-slate-400 hover:text-red-500">
                           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                         </button>
                       </div>
                     ))}
                   </div>
                </div>
              )}

              {/* Explicit Allergies */}
              {user.allergies.length > 0 && (
                <div>
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Known Allergies</h3>
                   <div className="space-y-2">
                     {user.allergies.map((item, idx) => (
                       <div key={`allergy-${idx}`} className="flex justify-between items-center bg-red-50 p-3 rounded-lg border border-red-100">
                         <span className="font-medium text-red-800">{item}</span>
                         <span className="text-xs text-red-400 bg-white px-2 py-0.5 rounded">Selected</span>
                       </div>
                     ))}
                   </div>
                </div>
              )}

              {/* Generated/Inferred */}
              {user.generatedAvoidanceList.length > 0 && (
                <div>
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recommended Avoidances (AI Inferred)</h3>
                   <div className="space-y-2">
                     {user.generatedAvoidanceList.map((item, idx) => (
                       <div key={`gen-${idx}`} className="flex justify-between items-center bg-slate-100 p-3 rounded-lg border border-slate-200">
                         <span className="font-medium text-slate-700">{item}</span>
                         <button onClick={() => handleRemoveAvoidItem(item, false)} className="text-slate-400 hover:text-red-500" title="Remove recommendation">
                           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                         </button>
                       </div>
                     ))}
                   </div>
                </div>
              )}

              {user.customAvoidanceList.length === 0 && user.allergies.length === 0 && user.generatedAvoidanceList.length === 0 && (
                  <div className="text-center text-slate-400 py-10">
                      Your avoid list is empty.
                  </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'CONDITIONS' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Diagnosed Conditions</h3>
              <div className="flex flex-wrap gap-2">
                {user.conditions.length > 0 ? user.conditions.map(c => (
                  <span key={c} className="bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg border border-teal-100 font-medium">
                    {c}
                  </span>
                )) : <p className="text-slate-500 italic">None listed</p>}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Health Goals</h3>
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-slate-700 italic">
                "{user.goals || "No specific goals listed."}"
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyDietList;