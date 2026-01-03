import React, { useState } from 'react';
import { UserProfile } from '../types';

// Duplicated constants for component isolation/portability
const MEDICAL_CONDITIONS = [
  "Celiac Disease", "IBS (Irritable Bowel Syndrome)", "Lactose Intolerance", "Diabetes Type 1", 
  "Diabetes Type 2", "GERD (Acid Reflux)", "Crohn's Disease", "Ulcerative Colitis", "Gastritis", 
  "Histamine Intolerance", "Fructose Malabsorption", "Eosinophilic Esophagitis", "Gout", 
  "Hypertension", "Kidney Disease", "Pancreatitis", "Diverticulitis", "Hashimoto's Thyroiditis", 
  "PKU (Phenylketonuria)", "Alpha-gal Syndrome"
];

const COMPREHENSIVE_ALLERGENS = [
  "Peanuts", "Tree Nuts", "Milk/Dairy", "Eggs", "Shellfish", "Fish", "Soy", "Wheat", "Sesame",
  "Gluten", "Mustard", "Celery", "Sulfites", "Lupin", "Molluscs", "Corn", "Nightshades",
  "Garlic", "Onion", "FODMAPs", "Red Meat", "Pork", "Alcohol", "Caffeine", "Chocolate",
  "Strawberries", "Kiwi", "Citrus", "Latex (Food Cross-React)", "Artificial Sweeteners (Aspartame)",
  "MSG", "Food Dyes (Red 40)", "Yeast"
];

interface MyDietListProps {
  user: UserProfile;
  onUpdateUser: (updatedProfile: UserProfile) => void;
  onMedicalUpdate: (conditions: string[], allergies: string[], goals: string) => void;
  onBack: () => void;
}

const MyDietList: React.FC<MyDietListProps> = ({ user, onUpdateUser, onMedicalUpdate, onBack }) => {
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'SAFE' | 'UNSAFE'>('PROFILE');
  
  // Quick Add State
  const [newItem, setNewItem] = useState('');

  // Medical Profile Edit State
  const [editConditions, setEditConditions] = useState<string[]>(user.conditions || []);
  const [editAllergies, setEditAllergies] = useState<string[]>(user.allergies || []);
  const [editGoals, setEditGoals] = useState(user.goals || '');
  const [conditionSearch, setConditionSearch] = useState('');
  const [allergySearch, setAllergySearch] = useState('');

  // --- Handlers for Safe/Unsafe Lists ---
  const handleAddItem = () => {
    if (!newItem.trim()) return;
    const val = newItem.trim();
    const updated = { ...user };
    
    if (activeTab === 'SAFE') {
        updated.safeFoodList = [...updated.safeFoodList, val];
    } else if (activeTab === 'UNSAFE') {
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

  // --- Handlers for Medical Profile ---
  const toggleCondition = (item: string) => {
    setEditConditions(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
    setConditionSearch('');
  };

  const toggleAllergy = (item: string) => {
    setEditAllergies(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
    setAllergySearch('');
  };

  const handleAddCustomCondition = () => {
      if(conditionSearch.trim() && !editConditions.includes(conditionSearch.trim())) {
          setEditConditions([...editConditions, conditionSearch.trim()]);
          setConditionSearch('');
      }
  };

  const handleAddCustomAllergy = () => {
      if(allergySearch.trim() && !editAllergies.includes(allergySearch.trim())) {
          setEditAllergies([...editAllergies, allergySearch.trim()]);
          setAllergySearch('');
      }
  };

  const handleSaveMedicalProfile = () => {
      onMedicalUpdate(editConditions, editAllergies, editGoals);
  };

  // Filters for Autocomplete
  const filteredConditions = MEDICAL_CONDITIONS.filter(c => 
    c.toLowerCase().includes(conditionSearch.toLowerCase()) && !editConditions.includes(c)
  ).slice(0, 5);

  const filteredAllergens = COMPREHENSIVE_ALLERGENS.filter(a =>
    a.toLowerCase().includes(allergySearch.toLowerCase()) && !editAllergies.includes(a)
  ).slice(0, 5);

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
          onClick={() => setActiveTab('PROFILE')}
          className={`flex-1 py-4 text-xs sm:text-sm font-medium border-b-2 transition-colors ${activeTab === 'PROFILE' ? 'border-teal-500 text-teal-600 dark:text-teal-400' : 'border-transparent text-slate-500 dark:text-slate-400'}`}
        >
          Medical Profile
        </button>
        <button 
          onClick={() => setActiveTab('UNSAFE')}
          className={`flex-1 py-4 text-xs sm:text-sm font-medium border-b-2 transition-colors ${activeTab === 'UNSAFE' ? 'border-red-500 text-red-600 dark:text-red-400' : 'border-transparent text-slate-500 dark:text-slate-400'}`}
        >
          Unsafe Foods
        </button>
        <button 
          onClick={() => setActiveTab('SAFE')}
          className={`flex-1 py-4 text-xs sm:text-sm font-medium border-b-2 transition-colors ${activeTab === 'SAFE' ? 'border-green-500 text-green-600 dark:text-green-400' : 'border-transparent text-slate-500 dark:text-slate-400'}`}
        >
          Safe Foods
        </button>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 overflow-y-auto">
        
        {/* === MEDICAL PROFILE TAB === */}
        {activeTab === 'PROFILE' && (
            <div className="space-y-8 animate-fade-in">
                
                {/* Conditions Section */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-500"><path d="M4.8 2.3A.3.3 0 0 0 5 2h14a.3.3 0 0 0 .2.3l-8.2 6.6a2 2 0 0 0-.8 1.2V12a2 2 0 0 0 .6 1.6l3.4 3.4c.6.6.6 1.5 0 2.1l-1.4 1.4a2 2 0 0 1-2.8 0L8 18.5a2 2 0 0 1-.6-1.6v-2a2 2 0 0 0-.8-1.2L4.8 2.3z"></path></svg>
                        Conditions
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {editConditions.map(c => (
                            <span key={c} className="bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                                {c}
                                <button onClick={() => toggleCondition(c)} className="hover:text-teal-950 dark:hover:text-white">×</button>
                            </span>
                        ))}
                    </div>
                    <div className="relative">
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={conditionSearch} 
                                onChange={(e) => setConditionSearch(e.target.value)}
                                placeholder="Add condition..." 
                                className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-teal-500 dark:text-white"
                            />
                             <button onClick={handleAddCustomCondition} disabled={!conditionSearch.trim()} className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-white px-3 rounded-lg text-sm font-bold disabled:opacity-50">Add</button>
                        </div>
                        {conditionSearch && filteredConditions.length > 0 && (
                            <div className="absolute z-10 w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg mt-1">
                                {filteredConditions.map(c => (
                                    <button key={c} onClick={() => toggleCondition(c)} className="w-full text-left px-4 py-2 hover:bg-teal-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 block text-sm">
                                        {c}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Allergies Section */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                         <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        Allergies
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {editAllergies.map(a => (
                            <span key={a} className="bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                                {a}
                                <button onClick={() => toggleAllergy(a)} className="hover:text-red-950 dark:hover:text-white">×</button>
                            </span>
                        ))}
                    </div>
                    <div className="relative">
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={allergySearch} 
                                onChange={(e) => setAllergySearch(e.target.value)}
                                placeholder="Add allergy..." 
                                className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-red-500 dark:text-white"
                            />
                            <button onClick={handleAddCustomAllergy} disabled={!allergySearch.trim()} className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-white px-3 rounded-lg text-sm font-bold disabled:opacity-50">Add</button>
                        </div>
                        {allergySearch && filteredAllergens.length > 0 && (
                            <div className="absolute z-10 w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg mt-1">
                                {filteredAllergens.map(a => (
                                    <button key={a} onClick={() => toggleAllergy(a)} className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 block text-sm">
                                        {a}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Goals Section */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4">Dietary Goals</h3>
                    <textarea 
                        value={editGoals}
                        onChange={(e) => setEditGoals(e.target.value)}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-teal-500 text-slate-800 dark:text-white h-24 resize-none"
                    />
                </div>

                {/* Save Action */}
                <button 
                    onClick={handleSaveMedicalProfile}
                    className="w-full bg-slate-900 dark:bg-teal-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-slate-800 dark:hover:bg-teal-500 transition-all active:scale-95"
                >
                    Save & Regenerate Recommendations
                </button>
            </div>
        )}

        {/* === SAFE & UNSAFE TABS (Existing Logic) === */}
        {(activeTab === 'SAFE' || activeTab === 'UNSAFE') && (
        <div className="animate-fade-in">
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
        )}

      </div>
    </div>
  );
};

export default MyDietList;