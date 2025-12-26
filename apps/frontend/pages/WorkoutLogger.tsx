
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { 
  Play, Calendar as CalendarIcon, Dumbbell, ChevronLeft, 
  Clock, Check, Plus, MoreHorizontal, Settings, 
  ChevronRight, X, Minimize2, BarChart2, Flame 
} from 'lucide-react';
import { GeneratedDailyPlan, SetLog, WorkoutLog } from '../types';
import { storage } from '../services/storageService';
import { useNavigate } from 'react-router-dom';

// --- Types for internal view state ---
type ViewMode = 'calendar' | 'detail' | 'active';

// --- Helper Functions ---
const getDayName = (date: Date, lang: string) => {
  return date.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { weekday: 'short' });
};

const getDatesOfWeek = (currentDate: Date) => {
  const dates = [];
  // Adjust to get Monday as start or Sunday? Let's assume Monday start for fitness apps usually
  const day = currentDate.getDay();
  const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(currentDate.setDate(diff));

  for (let i = 0; i < 7; i++) {
    const nextDate = new Date(monday);
    nextDate.setDate(monday.getDate() + i);
    dates.push(nextDate);
  }
  return dates;
};

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const WorkoutLogger: React.FC = () => {
  const { t, activePlan, profile, refreshData, exercises } = useAppContext();
  const navigate = useNavigate();
  
  // Global State
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Selection State
  const [selectedDayPlan, setSelectedDayPlan] = useState<GeneratedDailyPlan | null>(null);

  // Active Session State
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [sessionData, setSessionData] = useState<Record<number, { weight: string, reps: string, completed: boolean }[]>>({});
  
  // Timer Refs
  // Fixed: Replaced NodeJS.Timeout with any to avoid namespace issues in browser environment.
  const durationTimerRef = useRef<any>(null);

  // --- Derived Data ---
  const weekDates = useMemo(() => getDatesOfWeek(new Date()), []);
  
  // Map selected date to a plan day (Simple mapping: Mon=Day1, Tue=Day2...)
  // In a real app, this would be more complex logic based on user's start date
  useEffect(() => {
    if (!activePlan) {
      setSelectedDayPlan(null);
      return;
    }

    // Determine Day Index (0 = Mon, 6 = Sun)
    let dayIndex = selectedDate.getDay() - 1;
    if (dayIndex === -1) dayIndex = 6; // Sunday

    // Check if the plan has a workout for this index
    // Assuming generated plan is sequential. If user selected 3 days/week, 
    // activePlan.weekly_plan might only have 3 items.
    // We need a way to map them. For now, let's map strictly by index if available, else Rest.
    // OR if the plan explicitly says "Day 1", "Day 2", we map sequentially to Mon, Wed, Fri for simplicity in this demo.
    
    // Demo Logic: Just map index to plan array if it exists
    if (dayIndex < activePlan.weekly_plan.length) {
      setSelectedDayPlan(activePlan.weekly_plan[dayIndex]);
    } else {
      setSelectedDayPlan(null); // Rest day
    }
  }, [selectedDate, activePlan]);

  // --- Session Timer ---
  useEffect(() => {
    if (viewMode === 'active') {
      durationTimerRef.current = setInterval(() => {
        setDurationSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    }
    return () => {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, [viewMode]);

  // --- Handlers ---

  const handleStartSession = () => {
    if (!selectedDayPlan) return;
    
    // Init session data
    const initialData: Record<number, any[]> = {};
    selectedDayPlan.exercises.forEach((ex, idx) => {
      const sets = [];
      const defaultReps = ex.reps.split('-')[0].trim();
      for (let i = 0; i < ex.sets; i++) {
        sets.push({ weight: '', reps: defaultReps, completed: false });
      }
      initialData[idx] = sets;
    });
    
    setSessionData(initialData);
    setSessionStartTime(Date.now());
    setDurationSeconds(0);
    setViewMode('active');
  };

  const handleUpdateSet = (exIdx: number, setIdx: number, field: 'weight' | 'reps', value: string) => {
    setSessionData(prev => {
      const exSets = [...prev[exIdx]];
      exSets[setIdx] = { ...exSets[setIdx], [field]: value };
      return { ...prev, [exIdx]: exSets };
    });
  };

  const toggleSetComplete = (exIdx: number, setIdx: number) => {
    setSessionData(prev => {
      const exSets = [...prev[exIdx]];
      exSets[setIdx] = { ...exSets[setIdx], completed: !exSets[setIdx].completed };
      return { ...prev, [exIdx]: exSets };
    });
  };

  const handleFinish = () => {
    if (!selectedDayPlan) return;
    
    const exercisesLog = selectedDayPlan.exercises.map((ex, idx) => {
      const setsData = sessionData[idx] || [];
      const completedSets: SetLog[] = setsData
        .filter(s => s.completed)
        .map(s => ({
          id: Math.random().toString(),
          weight: parseFloat(s.weight) || 0,
          reps: parseFloat(s.reps) || 0,
          completed: true,
          timestamp: Date.now()
        }));

      if (completedSets.length === 0) return null;

      return {
        id: Math.random().toString(),
        exercise_id: ex.name,
        sets: completedSets
      };
    }).filter(Boolean) as any[];

    if (exercisesLog.length > 0) {
      const totalVolume = exercisesLog.reduce((acc, ex) => {
        return acc + ex.sets.reduce((sAcc: number, s: SetLog) => sAcc + (s.weight * s.reps), 0);
      }, 0);

      const newLog: WorkoutLog = {
        id: Date.now().toString(),
        user_id: profile.id,
        name: selectedDayPlan.focus,
        date: new Date().toISOString(),
        duration_minutes: Math.round(durationSeconds / 60),
        total_volume: totalVolume,
        exercises: exercisesLog
      };

      storage.saveWorkoutLog(profile.id, newLog);
      refreshData();
    }
    
    setViewMode('calendar');
  };

  const getExerciseImage = (name: string) => {
    // Try to find a matching exercise in library or fallback
    const found = exercises.find(e => 
      e.name.toLowerCase().includes(name.toLowerCase()) || 
      (e.name_zh && e.name_zh.includes(name))
    );
    return found?.image_url || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=100&q=80';
  };

  // --- RENDERERS ---

  // 1. Calendar / Dashboard View (Matches Image 1)
  const renderDashboard = () => (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="px-4 py-4 flex justify-between items-center sticky top-0 bg-background z-10">
        <ChevronLeft size={24} className="text-white" onClick={() => navigate('/')} />
        <div className="bg-zinc-800 px-3 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1">
          <span className="text-primary">Completed 4</span> <span className="text-zinc-500">|</span> <span>6</span>
        </div>
        <Settings size={24} className="text-white" />
      </div>

      {/* Calendar Strip */}
      <div className="px-4 mb-6">
        <div className="flex justify-between items-center">
          {weekDates.map((date, idx) => {
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const isToday = date.toDateString() === new Date().toDateString();
            return (
              <button 
                key={idx}
                onClick={() => setSelectedDate(date)}
                className={`flex flex-col items-center justify-center w-10 h-14 rounded-full transition-all ${
                  isSelected 
                    ? 'bg-white text-black shadow-lg shadow-white/10' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <span className="text-[10px] uppercase font-bold mb-1">{getDayName(date, profile.language)}</span>
                <span className={`text-sm font-bold ${isToday && !isSelected ? 'text-primary' : ''}`}>
                  {date.getDate()}
                </span>
                {isSelected && <div className="w-1 h-1 bg-black rounded-full mt-1"></div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Today's Workout Section */}
      <div className="px-4 flex-1">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">
            {profile.language === 'zh' ? '今日训练' : "Today's Workout"}
          </h2>
          <div className="flex gap-4 text-xs font-medium text-primary">
            <button>{profile.language === 'zh' ? '调整顺序' : 'Adjust'}</button>
            <button>{profile.language === 'zh' ? '设置' : 'Settings'}</button>
          </div>
        </div>

        {selectedDayPlan ? (
          <div 
            onClick={() => setViewMode('detail')}
            className="w-full h-40 rounded-2xl bg-zinc-800 relative overflow-hidden cursor-pointer group border border-zinc-700/50 hover:border-primary transition-all"
          >
            {/* Background Image Overlay */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80')] bg-cover bg-center opacity-40 group-hover:opacity-50 transition-opacity"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent"></div>
            
            <div className="relative z-10 p-5 h-full flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-white mb-1">{selectedDayPlan.focus}</h3>
              <p className="text-sm text-gray-300 mb-4">
                {selectedDayPlan.exercises.length} Exercises · {selectedDayPlan.exercises.reduce((acc, ex) => acc + ex.sets, 0)} Sets
              </p>
              <span className="text-xs font-bold text-white flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                {profile.language === 'zh' ? '查看模版' : 'View Template'} <ChevronRight size={14} />
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full h-40 rounded-2xl bg-zinc-900 border border-zinc-800 border-dashed flex flex-col items-center justify-center text-zinc-500">
             <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-2">
               <CalendarIcon size={20} />
             </div>
             <p className="text-sm">Rest Day</p>
          </div>
        )}

        {/* Nutrition Mockup (Visually matching reference) */}
        <div className="mt-8">
           <div className="flex justify-between items-center mb-4">
             <h2 className="text-base font-bold text-white">{profile.language === 'zh' ? '今日营养' : "Nutrition"}</h2>
             <span className="text-xs border border-primary text-primary px-2 py-0.5 rounded-full">
               Target: 75kg
             </span>
           </div>
           <div className="grid grid-cols-4 gap-2">
              <div className="bg-yellow-900/10 p-3 rounded-xl flex flex-col items-center justify-center text-center">
                 <span className="text-[10px] text-zinc-400">Protein</span>
                 <span className="text-sm font-bold text-yellow-500">0<span className="text-[10px] text-zinc-500 font-normal">/180</span></span>
              </div>
              <div className="bg-blue-900/10 p-3 rounded-xl flex flex-col items-center justify-center text-center">
                 <span className="text-[10px] text-zinc-400">Carbs</span>
                 <span className="text-sm font-bold text-blue-500">0<span className="text-[10px] text-zinc-500 font-normal">/225</span></span>
              </div>
              <div className="bg-red-900/10 p-3 rounded-xl flex flex-col items-center justify-center text-center">
                 <span className="text-[10px] text-zinc-400">Fat</span>
                 <span className="text-sm font-bold text-red-500">0<span className="text-[10px] text-zinc-500 font-normal">/75</span></span>
              </div>
              <div className="bg-cyan-900/10 p-3 rounded-xl flex flex-col items-center justify-center text-center">
                 <span className="text-[10px] text-zinc-400">Water</span>
                 <span className="text-sm font-bold text-cyan-500">0<span className="text-[10px] text-zinc-500 font-normal">/2L</span></span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );

  // 2. Detail View (Matches Image 2)
  const renderDetail = () => {
    if (!selectedDayPlan) return null;
    return (
      <div className="flex flex-col min-h-screen bg-background relative pb-24">
        {/* Header */}
        <div className="px-4 py-4 flex items-center justify-between sticky top-0 bg-background z-10 border-b border-zinc-900">
           <ChevronLeft size={24} className="text-white cursor-pointer" onClick={() => setViewMode('calendar')} />
           <h1 className="text-base font-bold text-white">{selectedDayPlan.focus}</h1>
           <div className="w-6"></div> {/* Spacer */}
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
           <div className="flex gap-2">
              <button className="bg-zinc-800 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                 {profile.language === 'zh' ? '练前热身' : 'Warm-up'}
              </button>
              <button className="bg-transparent text-zinc-500 text-xs px-3 py-1.5 rounded-full font-medium">
                 {profile.language === 'zh' ? '练后放松' : 'Cool-down'}
              </button>
           </div>

           <div className="space-y-6">
              {selectedDayPlan.exercises.map((ex, idx) => (
                <div key={idx} className="flex gap-4">
                   <img 
                      src={getExerciseImage(ex.name)} 
                      className="w-16 h-16 rounded-lg bg-zinc-800 object-cover shrink-0"
                   />
                   <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                         <h3 className="text-sm font-bold text-white">{ex.name}</h3>
                         <button className="bg-zinc-800 text-zinc-400 text-[10px] px-2 py-0.5 rounded">
                           {profile.language === 'zh' ? '设置' : 'Settings'}
                         </button>
                      </div>
                      <p className="text-[10px] text-secondary mb-2">
                        {profile.language === 'zh' ? `间歇 ${ex.rest}` : `Rest ${ex.rest}`}
                      </p>
                      
                      {/* Sets Preview List */}
                      <div className="space-y-1">
                         {Array.from({length: ex.sets}).map((_, sIdx) => (
                           <div key={sIdx} className="flex items-center gap-2 text-xs">
                              <span className="w-4 h-4 rounded-full bg-zinc-800 text-[8px] text-zinc-500 flex items-center justify-center">
                                {sIdx + 1}
                              </span>
                              <span className="text-zinc-300">{ex.reps} reps</span>
                              <span className="text-zinc-500">x</span>
                              <span className="text-zinc-300">-- kg</span>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Bottom Floating Action Bar */}
        <div className="fixed bottom-0 left-0 w-full bg-surface/95 backdrop-blur border-t border-border p-4 pb-8 z-20">
           <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
              <div className="flex gap-6 text-zinc-500">
                  <div className="flex flex-col items-center gap-1 cursor-pointer hover:text-white">
                      <Minimize2 size={20} />
                  </div>
                  <div className="flex flex-col items-center gap-1 cursor-pointer hover:text-white">
                      <Plus size={20} />
                  </div>
              </div>
              
              <button 
                onClick={handleStartSession}
                className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold h-12 rounded-full flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary/20"
              >
                <Play size={20} fill="currentColor" />
                {profile.language === 'zh' ? '开始训练' : 'Start Training'}
              </button>

              <div className="flex gap-6 text-zinc-500">
                  <div className="flex flex-col items-center gap-1 cursor-pointer hover:text-white">
                      <BarChart2 size={20} />
                  </div>
              </div>
           </div>
        </div>
      </div>
    );
  };

  // 3. Active View (Matches Image 3)
  const renderActive = () => {
    if (!selectedDayPlan) return null;
    return (
      <div className="flex flex-col min-h-screen bg-background relative pb-32">
        {/* Top Bar */}
        <div className="sticky top-0 bg-background/95 backdrop-blur z-20 border-b border-border">
          <div className="px-4 py-3 flex justify-between items-center">
             <div className="text-3xl font-bold text-primary font-mono tracking-tight">
               {formatTime(durationSeconds)}
             </div>
             <div className="flex items-center gap-2">
               <div className="flex bg-zinc-800 rounded-full p-1">
                  <button className="px-3 py-1 rounded-full bg-white text-black text-xs font-bold">
                    {profile.language === 'zh' ? '热身' : 'Warm-up'}
                  </button>
                  <button className="px-3 py-1 rounded-full text-zinc-400 text-xs font-medium">
                    {profile.language === 'zh' ? '放松' : 'Cool-down'}
                  </button>
               </div>
               <button 
                 onClick={handleFinish}
                 className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-full"
               >
                 {profile.language === 'zh' ? '完成' : 'Finish'}
               </button>
             </div>
          </div>
          
          {/* Sub Header */}
          <div className="px-4 py-2 flex justify-between items-center bg-zinc-900/50">
             <div className="flex items-center gap-2 text-white font-medium text-sm">
                <Settings size={14} className="text-zinc-500" />
                {selectedDayPlan.focus}
             </div>
             <div className="text-[10px] text-zinc-500 flex gap-2">
                <span>0/{selectedDayPlan.exercises.reduce((acc,e)=>acc+e.sets,0)} sets</span>
                <span>0/{selectedDayPlan.exercises.length} moves</span>
             </div>
          </div>
        </div>

        {/* Exercises List */}
        <div className="p-4 space-y-8">
           {selectedDayPlan.exercises.map((ex, exIdx) => (
              <div key={exIdx} className="bg-surface rounded-2xl p-4 border border-zinc-800 shadow-sm">
                 {/* Exercise Header */}
                 <div className="flex items-start gap-4 mb-4">
                    <img src={getExerciseImage(ex.name)} className="w-12 h-12 rounded-md bg-zinc-900 object-cover" />
                    <div className="flex-1">
                       <div className="flex justify-between items-start">
                          <h3 className="text-base font-bold text-white">{ex.name}</h3>
                          <Settings size={16} className="text-blue-500" />
                       </div>
                       <p className="text-xs text-zinc-500 mt-0.5">0.0 / 2160.0 kg</p>
                    </div>
                 </div>

                 {/* Note Input */}
                 <input 
                   type="text" 
                   placeholder={profile.language === 'zh' ? '点击输入备注' : 'Tap to add notes'} 
                   className="w-full bg-transparent text-xs text-zinc-400 placeholder:text-zinc-600 mb-4 focus:outline-none"
                 />
                 
                 {/* Sets List */}
                 <div className="space-y-3">
                    <div className="flex gap-2">
                       <button className="bg-zinc-800 text-zinc-400 text-[10px] px-2 py-1 rounded flex items-center gap-1">
                          <Check size={10} /> {profile.language === 'zh' ? '每组计时' : 'Timer per set'}
                       </button>
                    </div>

                    {sessionData[exIdx]?.map((set, setIdx) => (
                      <div key={setIdx} className="flex items-center gap-2 h-10">
                         {/* Set Label */}
                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${setIdx < 2 ? 'bg-orange-500/10 text-orange-500' : 'bg-zinc-800 text-zinc-400'}`}>
                            {setIdx < 2 ? (profile.language === 'zh' ? '热' : 'W') : (setIdx - 1)}
                         </div>

                         {/* Weight Input */}
                         <div className="flex-1 relative h-full">
                           <input 
                             type="number" 
                             value={set.weight}
                             onChange={(e) => handleUpdateSet(exIdx, setIdx, 'weight', e.target.value)}
                             className={`w-full h-full bg-zinc-900 rounded-lg text-center font-bold text-white focus:outline-none focus:ring-1 focus:ring-primary ${set.completed ? 'opacity-50' : ''}`}
                           />
                           <span className="absolute top-1 left-2 text-[8px] text-zinc-500">kg</span>
                         </div>

                         {/* Reps Input */}
                         <div className="flex-1 relative h-full">
                           <input 
                             type="number" 
                             value={set.reps}
                             placeholder={ex.reps}
                             onChange={(e) => handleUpdateSet(exIdx, setIdx, 'reps', e.target.value)}
                             className={`w-full h-full bg-zinc-900 rounded-lg text-center font-bold text-white focus:outline-none focus:ring-1 focus:ring-primary ${set.completed ? 'opacity-50' : ''}`}
                           />
                           <span className="absolute top-1 left-2 text-[8px] text-zinc-500">{profile.language === 'zh' ? '次' : 'reps'}</span>
                         </div>

                         {/* Check Button */}
                         <button 
                           onClick={() => toggleSetComplete(exIdx, setIdx)}
                           className={`h-full w-12 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                             set.completed 
                             ? 'bg-zinc-300 text-green-600' // Matches the grey-ish check with green tick style in reference active state image
                             : 'bg-zinc-800 text-zinc-600 hover:bg-zinc-700'
                           }`}
                         >
                            <Check size={20} strokeWidth={3} />
                         </button>
                         
                         <button className="text-blue-500 px-1">
                            <MoreHorizontal size={16} />
                         </button>
                      </div>
                    ))}
                 </div>
                 
                 {/* Feedback RPE */}
                 <div className="flex justify-between items-center mt-6 pt-4 border-t border-zinc-800">
                    <div className="flex flex-col items-center gap-1 cursor-pointer group">
                       <div className="w-5 h-5 rounded-full border-2 border-green-500 group-hover:bg-green-500 transition-colors"></div>
                       <span className="text-[10px] text-green-500">{profile.language === 'zh' ? '简单' : 'Easy'}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 cursor-pointer group">
                       <div className="w-5 h-5 rounded-full border-2 border-yellow-500 group-hover:bg-yellow-500 transition-colors"></div>
                       <span className="text-[10px] text-yellow-500">{profile.language === 'zh' ? '正常' : 'Normal'}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 cursor-pointer group">
                       <div className="w-5 h-5 rounded-full border-2 border-red-500 group-hover:bg-red-500 transition-colors"></div>
                       <span className="text-[10px] text-red-500">{profile.language === 'zh' ? '困难' : 'Hard'}</span>
                    </div>
                 </div>

                 {/* Action Buttons */}
                 <div className="grid grid-cols-2 gap-3 mt-4">
                    <button className="bg-zinc-900 py-2 rounded-lg text-xs font-bold text-zinc-300 hover:bg-zinc-800">
                      {profile.language === 'zh' ? '新增一组' : 'Add Set'}
                    </button>
                    <button className="bg-zinc-900 py-2 rounded-lg text-xs font-bold text-zinc-300 hover:bg-zinc-800">
                      {profile.language === 'zh' ? '动作历史' : 'History'}
                    </button>
                 </div>
              </div>
           ))}
        </div>

        {/* Bottom Nav (Active Mode) */}
        <div className="fixed bottom-0 left-0 w-full bg-surface border-t border-border z-20">
            <div className="flex justify-around items-center h-16 text-[10px] text-zinc-500">
                <div className="flex flex-col items-center gap-1"><Minimize2 size={18} /><span>Minimize</span></div>
                <div className="flex flex-col items-center gap-1"><Dumbbell size={18} /><span>Change</span></div>
                <div className="flex flex-col items-center justify-center -mt-6">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                        <Plus size={24} />
                    </div>
                    <span className="mt-1 text-white">Add Action</span>
                </div>
                <div className="flex flex-col items-center gap-1"><CalendarIcon size={18} /><span>Note</span></div>
                <div className="flex flex-col items-center gap-1"><Clock size={18} /><span>Watch</span></div>
            </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {viewMode === 'calendar' && renderDashboard()}
      {viewMode === 'detail' && renderDetail()}
      {viewMode === 'active' && renderActive()}
    </>
  );
};

export default WorkoutLogger;
