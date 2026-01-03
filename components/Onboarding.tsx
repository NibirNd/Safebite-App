import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  initialName?: string;
}

export const MEDICAL_CONDITIONS = [
  "Celiac Disease",
  "IBS (Irritable Bowel Syndrome)",
  "Lactose Intolerance",
  "Diabetes Type 1",
  "Diabetes Type 2",
  "GERD (Acid Reflux)",
  "Crohn's Disease",
  "Ulcerative Colitis",
  "Gastritis",
  "Histamine Intolerance",
  "Fructose Malabsorption",
  "Eosinophilic Esophagitis",
  "Gout",
  "Hypertension",
  "Kidney Disease",
  "Pancreatitis",
  "Diverticulitis",
  "Hashimoto's Thyroiditis",
  "PKU (Phenylketonuria)",
  "Alpha-gal Syndrome"
];

export const COMPREHENSIVE_ALLERGENS = [
  "Peanuts", "Tree Nuts", "Milk/Dairy", "Eggs", "Shellfish", "Fish", "Soy", "Wheat", "Sesame",
  "Gluten", "Mustard", "Celery", "Sulfites", "Lupin", "Molluscs", "Corn", "Nightshades",
  "Garlic", "Onion", "FODMAPs", "Red Meat", "Pork", "Alcohol", "Caffeine", "Chocolate",
  "Strawberries", "Kiwi", "Citrus", "Latex (Food Cross-React)", "Artificial Sweeteners (Aspartame)",
  "MSG", "Food Dyes (Red 40)", "Yeast"
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, initialName = '' }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(initialName);
  
  // Condition State
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [conditionSearch, setConditionSearch] = useState('');
  const [isAddingOtherCondition, setIsAddingOtherCondition] = useState(false);
  const [customCondition, setCustomCondition] = useState('');

  // Allergy State
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [allergySearch, setAllergySearch] = useState('');
  const [isAddingOtherAllergy, setIsAddingOtherAllergy] = useState(false);
  const [customAllergy, setCustomAllergy] = useState('');

  const [goals, setGoals] = useState('');

  const toggleSelection = (list: string[], item: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.includes(item)) {
      setter(list.filter(i => i !== item));
    } else {
      setter([...list, item]);
    }
  };

  // --- Condition Handlers ---
  const handleAddCondition = (condition: string) => {
    if (condition === "Other") {
      setIsAddingOtherCondition(true);
      setConditionSearch('');
    } else {
      if (!selectedConditions.includes(condition)) {
        setSelectedConditions([...selectedConditions, condition]);
      }
      setConditionSearch('');
    }
  };

  const handleAddCustomCondition = () => {
    if (customCondition.trim()) {
      setSelectedConditions([...selectedConditions, customCondition.trim()]);
      setCustomCondition('');
      setIsAddingOtherCondition(false);
    }
  };

  // --- Allergy Handlers ---
  const handleAddAllergy = (allergy: string) => {
    if (allergy === "Other") {
      setIsAddingOtherAllergy(true);
      setAllergySearch('');
    } else {
      if (!selectedAllergies.includes(allergy)) {
        setSelectedAllergies([...selectedAllergies, allergy]);
      }
      setAllergySearch('');
    }
  };

  const handleAddCustomAllergy = () => {
    if (customAllergy.trim()) {
      setSelectedAllergies([...selectedAllergies, customAllergy.trim()]);
      setCustomAllergy('');
      setIsAddingOtherAllergy(false);
    }
  };


  const filteredConditions = MEDICAL_CONDITIONS.filter(c => 
    c.toLowerCase().includes(conditionSearch.toLowerCase()) && 
    !selectedConditions.includes(c)
  );

  const filteredAllergens = COMPREHENSIVE_ALLERGENS.filter(a =>
    a.toLowerCase().includes(allergySearch.toLowerCase()) &&
    !selectedAllergies.includes(a)
  );

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = () => {
    const profile: UserProfile = {
      id: 'temp', // Placeholder, will be overwritten by parent
      authType: 'GUEST', // Placeholder, will be overwritten by parent
      name,
      conditions: selectedConditions,
      allergies: selectedAllergies,
      goals,
      isOnboarded: true,
      generatedAvoidanceList: [], // Populated later
      customAvoidanceList: [],
      safeFoodList: [],
      theme: 'light',
      journal: []
    };
    onComplete(profile);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-teal-50 p-6 animate-slide-up">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        
        {/* Progress Bar */}
        <div className="mb-8 flex gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-2 flex-1 rounded-full transition-colors ${i <= step ? 'bg-teal-500' : 'bg-gray-200'}`} />
          ))}
        </div>

        {step === 1 && (
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome</h1>
            <p className="text-slate-500 mb-6">Let's get to know you to keep you safe.</p>
            <label className="block text-sm font-medium text-slate-700 mb-2">What should we call you?</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Your Name"
            />
            <button 
              disabled={!name.trim()}
              onClick={handleNext}
              className="w-full mt-8 bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 disabled:opacity-50 transition-all"
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Medical Conditions</h2>
            <p className="text-slate-500 mb-4 text-sm">Search and select your diagnosed conditions.</p>
            
            {/* Selected Chips */}
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedConditions.map(c => (
                <span key={c} className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                  {c}
                  <button onClick={() => toggleSelection(selectedConditions, c, setSelectedConditions)} className="hover:text-teal-900">
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Custom Condition Input */}
            {isAddingOtherCondition ? (
              <div className="flex gap-2 mb-4 animate-slide-up">
                <input
                  type="text"
                  value={customCondition}
                  onChange={(e) => setCustomCondition(e.target.value)}
                  placeholder="Type your condition..."
                  className="flex-1 p-3 border border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  autoFocus
                />
                <button 
                  onClick={handleAddCustomCondition}
                  className="bg-teal-600 text-white px-4 rounded-lg font-semibold"
                >
                  Add
                </button>
                <button 
                  onClick={() => setIsAddingOtherCondition(false)}
                  className="text-slate-400 px-2"
                >
                  Cancel
                </button>
              </div>
            ) : (
              /* Search Input */
              <div className="relative mb-6">
                <input
                  type="text"
                  value={conditionSearch}
                  onChange={(e) => setConditionSearch(e.target.value)}
                  placeholder="Search conditions (e.g. Diabetes)..."
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                />
                
                {/* Dropdown Results */}
                {conditionSearch && (
                  <div className="absolute z-10 w-full bg-white border border-slate-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                    {filteredConditions.map(c => (
                      <button
                        key={c}
                        onClick={() => handleAddCondition(c)}
                        className="w-full text-left px-4 py-2 hover:bg-teal-50 text-slate-700 block"
                      >
                        {c}
                      </button>
                    ))}
                    <button
                      onClick={() => handleAddCondition("Other")}
                      className="w-full text-left px-4 py-2 hover:bg-teal-50 text-teal-600 font-medium border-t border-slate-100"
                    >
                      Other (Add Manually)...
                    </button>
                  </div>
                )}
                {!conditionSearch && (
                   <div className="mt-2 text-right">
                     <button onClick={() => handleAddCondition("Other")} className="text-sm text-teal-600 font-medium">
                       Can't find it? Add Other
                     </button>
                   </div>
                )}
              </div>
            )}

            <div className="mt-8 flex gap-4">
              <button onClick={handleBack} className="flex-1 py-3 text-slate-500 font-medium">Back</button>
              <button onClick={handleNext} className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700">Next</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Allergies & Sensitivities</h2>
            <p className="text-slate-500 mb-4 text-sm">Select ingredients or foods you must avoid.</p>
            
            {/* Selected Chips */}
             <div className="flex flex-wrap gap-2 mb-4">
              {selectedAllergies.map(a => (
                <span key={a} className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 border border-red-100">
                  {a}
                  <button onClick={() => toggleSelection(selectedAllergies, a, setSelectedAllergies)} className="hover:text-red-900">
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Custom Allergy Input */}
            {isAddingOtherAllergy ? (
              <div className="flex gap-2 mb-4 animate-slide-up">
                <input
                  type="text"
                  value={customAllergy}
                  onChange={(e) => setCustomAllergy(e.target.value)}
                  placeholder="Type specific ingredient..."
                  className="flex-1 p-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  autoFocus
                />
                <button 
                  onClick={handleAddCustomAllergy}
                  className="bg-red-600 text-white px-4 rounded-lg font-semibold"
                >
                  Add
                </button>
                <button 
                  onClick={() => setIsAddingOtherAllergy(false)}
                  className="text-slate-400 px-2"
                >
                  Cancel
                </button>
              </div>
            ) : (
              /* Search Input */
              <div className="relative mb-6">
                <input
                  type="text"
                  value={allergySearch}
                  onChange={(e) => setAllergySearch(e.target.value)}
                  placeholder="Search allergen (e.g. Gluten)..."
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                />
                
                {/* Dropdown Results */}
                {allergySearch && (
                  <div className="absolute z-10 w-full bg-white border border-slate-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                    {filteredAllergens.map(a => (
                      <button
                        key={a}
                        onClick={() => handleAddAllergy(a)}
                        className="w-full text-left px-4 py-2 hover:bg-red-50 text-slate-700 block"
                      >
                        {a}
                      </button>
                    ))}
                    <button
                      onClick={() => handleAddAllergy("Other")}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 font-medium border-t border-slate-100"
                    >
                      Other (Add Manually)...
                    </button>
                  </div>
                )}
                 {!allergySearch && (
                   <div className="mt-2 text-right">
                     <button onClick={() => handleAddAllergy("Other")} className="text-sm text-red-600 font-medium">
                       Can't find it? Add Other
                     </button>
                   </div>
                )}
              </div>
            )}

            <div className="mt-8 flex gap-4">
              <button onClick={handleBack} className="flex-1 py-3 text-slate-500 font-medium">Back</button>
              <button onClick={handleNext} className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700">Next</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Dietary Goals</h2>
            <p className="text-slate-500 mb-6 text-sm">Any specific goals we should know?</p>
            <textarea
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none h-32 resize-none"
              placeholder="e.g. Reduce gut inflammation, avoid bloating after meals..."
            />
            <div className="mt-8 flex gap-4">
              <button onClick={handleBack} className="flex-1 py-3 text-slate-500 font-medium">Back</button>
              <button onClick={handleSubmit} className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 shadow-lg shadow-teal-200">
                Finish Setup
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Onboarding;