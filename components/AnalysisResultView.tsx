import React, { useState } from 'react';
import { AnalysisResult, ThreatLevel } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AnalysisResultViewProps {
  result: AnalysisResult;
  onBack: () => void;
  onClassify: (foodName: string, isSafe: boolean) => void;
}

const AnalysisResultView: React.FC<AnalysisResultViewProps> = ({ result, onBack, onClassify }) => {
  const [classificationState, setClassificationState] = useState<'NONE' | 'SAFE' | 'UNSAFE'>('NONE');
  const isSafe = result.canEat;
  const isHighRisk = result.threatLevel === ThreatLevel.HIGH;

  // Dynamic Backgrounds for Light/Dark
  const bgGradient = isSafe 
    ? 'bg-gradient-to-b from-green-50 to-slate-50 dark:from-green-950 dark:to-slate-900' 
    : isHighRisk 
      ? 'bg-gradient-to-b from-red-50 to-slate-50 dark:from-red-950 dark:to-slate-900'
      : 'bg-gradient-to-b from-amber-50 to-slate-50 dark:from-amber-950 dark:to-slate-900';

  const accentColor = isSafe
    ? 'text-green-600 bg-green-100 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800'
    : isHighRisk
      ? 'text-red-600 bg-red-100 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800'
      : 'text-amber-600 bg-amber-100 border-amber-200 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-800';

  // Prepare chart data
  const chartData = result.nutrients.map(n => ({
    name: n.name.substring(0, 10), // Truncate for mobile
    risk: n.riskImpact,
    fullReason: n.reason
  }));

  const handleManualClassification = (safe: boolean) => {
    onClassify(result.foodName, safe);
    setClassificationState(safe ? 'SAFE' : 'UNSAFE');
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded shadow-lg text-xs max-w-[200px]">
          <p className="font-bold text-slate-800 dark:text-white">{label}</p>
          <p className="text-slate-600 dark:text-slate-300 mb-1">Risk Contribution: {payload[0].value}/100</p>
          <p className="text-slate-400 italic">{payload[0].payload.fullReason}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`min-h-screen ${bgGradient} flex flex-col p-6 animate-slide-up pb-24 transition-colors duration-300`}>
      {/* Header */}
      <button onClick={onBack} className="self-start mb-6 p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-200">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>

      {/* Hero Result */}
      <div className="flex flex-col items-center mb-8 text-center">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 mb-4 ${
          isSafe ? 'border-green-200 bg-green-100 dark:bg-green-900 dark:border-green-800' : isHighRisk ? 'border-red-200 bg-red-100 dark:bg-red-900 dark:border-red-800' : 'border-amber-200 bg-amber-100 dark:bg-amber-900 dark:border-amber-800'
        }`}>
          {isSafe 
            ? <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400"><polyline points="20 6 9 17 4 12"></polyline></svg>
            : <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isHighRisk ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          }
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{result.foodName}</h1>
        <div className={`px-4 py-1.5 rounded-full text-sm font-bold border tracking-wider ${accentColor}`}>
          {result.threatLevel} THREAT
        </div>
      </div>

      {/* Diary Classification Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 mb-6">
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-3 font-medium">Add to your Personal Diary</p>
        <div className="flex gap-3">
            <button 
                onClick={() => handleManualClassification(true)}
                className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                    classificationState === 'SAFE' 
                    ? 'bg-green-600 border-green-600 text-white' 
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-green-400 hover:text-green-600'
                }`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Mark Safe
            </button>
            <button 
                onClick={() => handleManualClassification(false)}
                className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                    classificationState === 'UNSAFE' 
                    ? 'bg-red-600 border-red-600 text-white' 
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-red-400 hover:text-red-600'
                }`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                Mark Unsafe
            </button>
        </div>
        {classificationState !== 'NONE' && (
            <p className="text-center text-xs text-slate-400 mt-2 animate-fade-in">
                Saved to your personal diary!
            </p>
        )}
      </div>

      {/* Summary */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 mb-6">
        <h2 className="font-bold text-slate-800 dark:text-white mb-2">Verdict</h2>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{result.detailedReasoning}</p>
        
        {result.riskyIngredients.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">Risky Ingredients Identified</h3>
            <div className="flex flex-wrap gap-2">
              {result.riskyIngredients.map((ing, i) => (
                <span key={i} className="px-2 py-1 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 text-xs rounded border border-red-100 dark:border-red-900 font-medium">
                  {ing}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Nutrient Impact Chart */}
      {result.nutrients.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 mb-6">
          <h2 className="font-bold text-slate-800 dark:text-white mb-4">Risk Factors & Nutrients</h2>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" fontSize={10} stroke="#94a3b8" />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                <Bar dataKey="risk" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.risk > 50 ? '#ef4444' : entry.risk > 20 ? '#f59e0b' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Sticky Bottom Action */}
      <div className="fixed bottom-6 left-0 right-0 px-6">
        <button 
          onClick={onBack}
          className="w-full bg-slate-900 dark:bg-teal-600 text-white py-4 rounded-2xl font-semibold shadow-xl shadow-slate-300 dark:shadow-teal-900 active:scale-95 transition-transform"
        >
          Scan Something Else
        </button>
      </div>
    </div>
  );
};

export default AnalysisResultView;