import React, { useState, useEffect } from 'react';
import { UserProfile, JournalEntry } from '../types';

interface DailyJournalProps {
  user: UserProfile;
  onAddEntry: (entry: JournalEntry) => void;
  onBack: () => void;
}

type Tab = 'LOG' | 'HISTORY';
type LogStatus = 'SAFE' | 'UNSAFE' | 'NEUTRAL';

const DailyJournal: React.FC<DailyJournalProps> = ({ user, onAddEntry, onBack }) => {
  const [activeTab, setActiveTab] = useState<Tab>('LOG');
  
  // --- Tab 1: LOG MEAL State ---
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [foodName, setFoodName] = useState('');
  const [notes, setNotes] = useState('');
  const [time, setTime] = useState(new Date().toTimeString().substring(0, 5)); // HH:MM
  const [status, setStatus] = useState<LogStatus>('NEUTRAL');

  // --- Tab 2: HISTORY State ---
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedHistoryDate, setSelectedHistoryDate] = useState(new Date());

  // Feedback State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // --- HANDLERS ---

  const handleSaveEntry = () => {
    if (!foodName.trim()) return;

    // Construct timestamp based on selected date AND entered time
    const [year, month, day] = logDate.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    const entryDate = new Date(year, month - 1, day, hours, minutes);

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      timestamp: entryDate.getTime(),
      foodName: foodName.trim(),
      notes: notes.trim(),
      status: status
    };

    onAddEntry(newEntry);
    
    // Feedback
    if (status === 'SAFE') {
        setToastMessage(`Saved! "${foodName}" added to Safe List.`);
    } else if (status === 'UNSAFE') {
        setToastMessage(`Saved! "${foodName}" marked as Unsafe.`);
    } else {
        setToastMessage('Meal logged successfully.');
    }
    
    // Switch to history tab to show the "Autosaved" result
    setSelectedHistoryDate(entryDate);
    // Ensure calendar month matches entry so it is visible
    setCalendarMonth(new Date(entryDate.getFullYear(), entryDate.getMonth(), 1));
    setActiveTab('HISTORY');
    
    // Reset form
    setFoodName('');
    setNotes('');
    setStatus('NEUTRAL');
    setTime(new Date().toTimeString().substring(0, 5));
  };

  // --- CALENDAR HELPERS ---

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
    return { days, firstDay };
  };

  const { days, firstDay } = getDaysInMonth(calendarMonth);
  const daysArray = Array.from({ length: days }, (_, i) => i + 1);
  const blanksArray = Array.from({ length: firstDay }, (_, i) => i);

  const prevMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getFullYear() === d2.getFullYear();
  };

  // Filter entries for the SELECTED HISTORY DATE
  const journalData = user.journal || [];
  
  const filteredEntries = journalData.filter(entry => 
    isSameDay(new Date(entry.timestamp), selectedHistoryDate)
  ).sort((a, b) => b.timestamp - a.timestamp);

  // Check if a specific day has entries (for dots in calendar)
  const hasEntryOnDay = (day: number) => {
    const checkDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    return journalData.some(entry => isSameDay(new Date(entry.timestamp), checkDate));
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col animate-slide-up transition-colors duration-300">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl z-50 animate-fade-in-up flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-400"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-6 shadow-sm border-b border-slate-100 dark:border-slate-700 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Daily Eating Journal</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <button 
          onClick={() => setActiveTab('LOG')}
          className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'LOG' ? 'border-teal-500 text-teal-600 dark:text-teal-400' : 'border-transparent text-slate-500 dark:text-slate-400'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          Log Meal
        </button>
        <button 
          onClick={() => setActiveTab('HISTORY')}
          className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'HISTORY' ? 'border-teal-500 text-teal-600 dark:text-teal-400' : 'border-transparent text-slate-500 dark:text-slate-400'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          History
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 pb-10">

        {/* --- TAB CONTENT: LOG MEAL --- */}
        {activeTab === 'LOG' && (
          <div className="p-6 animate-fade-in max-w-lg mx-auto">
             <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                
                {/* Date/Time Row */}
                <div className="flex gap-4 mb-6">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date</label>
                        <input 
                            type="date"
                            value={logDate}
                            onChange={(e) => setLogDate(e.target.value)}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:border-teal-500 text-slate-800 dark:text-white"
                        />
                    </div>
                    <div className="w-1/3">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Time</label>
                        <input 
                            type="time" 
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:border-teal-500 text-slate-800 dark:text-white"
                        />
                    </div>
                </div>

                {/* Food Name */}
                <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Food / Drink</label>
                    <input 
                        type="text"
                        value={foodName}
                        onChange={(e) => setFoodName(e.target.value)}
                        placeholder="e.g. Avocado Toast"
                        className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:border-teal-500 text-slate-800 dark:text-white font-medium text-lg"
                    />
                </div>

                {/* Notes */}
                <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Notes / Symptoms</label>
                    <textarea 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="How did you feel? Any reactions?"
                        className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:border-teal-500 text-slate-800 dark:text-white h-24 resize-none"
                    />
                </div>

                {/* Status Selection (Radio Style) */}
                <div className="mb-8">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">How was it?</label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setStatus('SAFE')}
                            className={`flex-1 py-3 rounded-lg border font-semibold flex flex-col items-center justify-center transition-all ${
                                status === 'SAFE' 
                                ? 'bg-green-500 text-white border-green-600 shadow-md' 
                                : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-green-50 dark:hover:bg-green-900/20'
                            }`}
                        >
                            <span className="text-lg mb-1">👍</span>
                            Safe
                        </button>
                        <button
                            onClick={() => setStatus('NEUTRAL')}
                            className={`flex-1 py-3 rounded-lg border font-semibold flex flex-col items-center justify-center transition-all ${
                                status === 'NEUTRAL' 
                                ? 'bg-slate-600 text-white border-slate-700 shadow-md' 
                                : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        >
                             <span className="text-lg mb-1">😐</span>
                             Okay
                        </button>
                        <button
                            onClick={() => setStatus('UNSAFE')}
                            className={`flex-1 py-3 rounded-lg border font-semibold flex flex-col items-center justify-center transition-all ${
                                status === 'UNSAFE' 
                                ? 'bg-red-500 text-white border-red-600 shadow-md' 
                                : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20'
                            }`}
                        >
                             <span className="text-lg mb-1">👎</span>
                             Unsafe
                        </button>
                    </div>
                </div>

                {/* Main Save Button */}
                <button 
                        onClick={handleSaveEntry}
                        disabled={!foodName.trim()}
                        className="w-full py-4 rounded-xl bg-slate-900 dark:bg-teal-600 text-white font-bold text-lg shadow-lg shadow-slate-200 dark:shadow-teal-900 hover:bg-slate-800 dark:hover:bg-teal-500 transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Save Log
                </button>
             </div>
          </div>
        )}

        {/* --- TAB CONTENT: HISTORY --- */}
        {activeTab === 'HISTORY' && (
          <div className="p-6 animate-fade-in max-w-lg mx-auto">
            
            {/* Calendar Widget */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={prevMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                    <h2 className="font-bold text-slate-800 dark:text-white">
                        {calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button onClick={nextMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {['S','M','T','W','T','F','S'].map(d => (
                        <div key={d} className="text-xs font-bold text-slate-400">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {blanksArray.map(x => <div key={`blank-${x}`} className="aspect-square"></div>)}
                    {daysArray.map(day => {
                        const thisDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                        const isSelected = isSameDay(thisDate, selectedHistoryDate);
                        const isToday = isSameDay(thisDate, new Date());
                        const hasData = hasEntryOnDay(day);

                        return (
                            <button
                                key={day}
                                onClick={() => setSelectedHistoryDate(thisDate)}
                                className={`aspect-square rounded-full flex flex-col items-center justify-center relative text-sm font-medium transition-all
                                    ${isSelected 
                                        ? 'bg-teal-600 text-white shadow-lg shadow-teal-200 dark:shadow-teal-900' 
                                        : isToday 
                                            ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700'
                                            : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                                    }
                                `}
                            >
                                {day}
                                {hasData && !isSelected && (
                                    <div className="absolute bottom-1 w-1 h-1 rounded-full bg-teal-500"></div>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Timeline List for Selected Date */}
            <div>
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
                     Timeline: {selectedHistoryDate.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                </h2>
                
                <div className="space-y-4">
                    {filteredEntries.map((entry) => (
                        <div key={entry.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 animate-slide-up flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-10 rounded-full ${
                                        entry.status === 'SAFE' ? 'bg-green-500' : entry.status === 'UNSAFE' ? 'bg-red-500' : 'bg-slate-300'
                                    }`}></div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 dark:text-white text-lg">{entry.foodName}</h3>
                                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                            {formatTime(entry.timestamp)}
                                        </div>
                                    </div>
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
                                <div className="ml-5 mt-1 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                                    <p className="text-sm text-slate-600 dark:text-slate-300 italic">"{entry.notes}"</p>
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {filteredEntries.length === 0 && (
                        <div className="text-center py-12">
                            <div className="inline-block p-4 rounded-full bg-slate-50 dark:bg-slate-800 mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                            </div>
                            <p className="text-slate-400 font-medium">No meals logged for this day.</p>
                            <button onClick={() => setActiveTab('LOG')} className="text-teal-600 dark:text-teal-400 text-sm font-bold mt-2 hover:underline">
                                Log a meal now
                            </button>
                        </div>
                    )}
                </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DailyJournal;