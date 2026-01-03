import React, { useState } from 'react';
import { UserProfile, JournalEntry } from '../types';

interface DailyJournalProps {
  user: UserProfile;
  onAddEntry: (entry: JournalEntry) => void;
  onBack: () => void;
}

const DailyJournal: React.FC<DailyJournalProps> = ({ user, onAddEntry, onBack }) => {
  const [foodName, setFoodName] = useState('');
  const [notes, setNotes] = useState('');
  const [time, setTime] = useState(new Date().toTimeString().substring(0, 5)); // HH:MM

  const handleAdd = (status: 'SAFE' | 'UNSAFE' | 'NEUTRAL') => {
    if (!foodName.trim()) return;

    // Convert time string to timestamp (relative to today)
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      timestamp: date.getTime(),
      foodName: foodName.trim(),
      notes: notes.trim(),
      status
    };

    onAddEntry(newEntry);
    
    // Reset form
    setFoodName('');
    setNotes('');
    setTime(new Date().toTimeString().substring(0, 5));
  };

  // Group entries by date (simple implementation for now, showing all sorted by recent)
  const sortedEntries = [...user.journal].sort((a, b) => b.timestamp - a.timestamp);

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (ts: number) => {
      return new Date(ts).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col animate-slide-up transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-6 shadow-sm border-b border-slate-100 dark:border-slate-700 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Daily Eating Journal</h1>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        
        {/* Input Section */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-8">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Log a Meal</h2>
            
            <div className="flex gap-4 mb-4">
                 <input 
                    type="time" 
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-28 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:border-teal-500 text-slate-800 dark:text-white"
                />
                <input 
                    type="text"
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    placeholder="What did you eat?"
                    className="flex-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:border-teal-500 text-slate-800 dark:text-white"
                />
            </div>
            
            <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did it make you feel? (e.g. Bloated, Energetic)"
                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:border-teal-500 text-slate-800 dark:text-white text-sm mb-4 h-20 resize-none"
            />

            <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">Classify & Save:</p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => handleAdd('UNSAFE')}
                        disabled={!foodName.trim()}
                        className="w-10 h-10 flex items-center justify-center rounded-full border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900 text-red-500 hover:bg-red-100 dark:hover:bg-red-800 active:scale-90 transition-all disabled:opacity-50"
                        title="Mark as Unsafe"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                    <button 
                        onClick={() => handleAdd('SAFE')}
                        disabled={!foodName.trim()}
                        className="w-10 h-10 flex items-center justify-center rounded-full border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900 text-green-500 hover:bg-green-100 dark:hover:bg-green-800 active:scale-90 transition-all disabled:opacity-50"
                        title="Mark as Safe"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </button>
                </div>
            </div>
        </div>

        {/* Timeline */}
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">History</h2>
        <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-4 space-y-8">
            {sortedEntries.map((entry) => (
                <div key={entry.id} className="relative pl-8">
                    {/* Dot */}
                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-white dark:bg-slate-900 ${
                        entry.status === 'SAFE' ? 'border-green-500' : entry.status === 'UNSAFE' ? 'border-red-500' : 'border-slate-300'
                    }`}></div>
                    
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between items-start mb-1">
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-white">{entry.foodName}</h3>
                                <p className="text-xs text-slate-400">{formatDate(entry.timestamp)} at {formatTime(entry.timestamp)}</p>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide ${
                                entry.status === 'SAFE' 
                                ? 'bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-300' 
                                : entry.status === 'UNSAFE' 
                                ? 'bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300' 
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                            }`}>
                                {entry.status}
                            </span>
                        </div>
                        {entry.notes && (
                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 italic">"{entry.notes}"</p>
                        )}
                    </div>
                </div>
            ))}
            
            {sortedEntries.length === 0 && (
                <div className="pl-8 text-slate-400 italic">No entries yet. Start logging above.</div>
            )}
        </div>

      </div>
    </div>
  );
};

export default DailyJournal;