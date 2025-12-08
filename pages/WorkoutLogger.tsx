import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { storage } from '../services/storageService';
import { Play, Plus, Search, Check, Trash2, Clock, Save, X, ChevronDown } from 'lucide-react';
import { Exercise, WorkoutLog, WorkoutExerciseLog, SetLog } from '../types';

// --- Helper Components ---

const ExercisePicker = ({ 
  isOpen, 
  onClose, 
  onSelect 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSelect: (ex: Exercise) => void; 
}) => {
  const { exercises, language } = useAppContext();
  const [term, setTerm] = useState('');

  if (!isOpen) return null;

  const filtered = exercises.filter(e => {
    const name = language === 'zh' && e.name_zh ? e.name_zh : e.name;
    return name.toLowerCase().includes(term.toLowerCase());
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col pt-10 pb-0 px-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-white">Select Exercise</h2>
        <button onClick={onClose} className="p-2 bg-zinc-800 rounded-full"><X size={20} /></button>
      </div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-3 text-muted" size={18} />
        <input 
          autoFocus
          type="text"
          placeholder="Search..."
          className="w-full bg-surface border border-border text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-primary"
          value={term}
          onChange={e => setTerm(e.target.value)}
        />
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pb-10">
        {filtered.map(ex => (
          <div 
            key={ex.id} 
            onClick={() => { onSelect(ex); onClose(); setTerm(''); }}
            className="bg-surface border border-border p-4 rounded-xl flex items-center gap-3 active:scale-95 transition-transform"
          >
            <img src={ex.image_url} className="w-10 h-10 rounded bg-zinc-800 object-cover" alt="" />
            <div>
              <div className="font-bold text-sm text-white">{language === 'zh' && ex.name_zh ? ex.name_zh : ex.name}</div>
              <div className="text-xs text-muted">{ex.target_muscle}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main Component ---

interface ActiveSet {
  id: string;
  weight: number;
  reps: number;
  completed: boolean;
}

interface ActiveExercise {
  instanceId: string;
  exerciseDef: Exercise;
  sets: ActiveSet[];
}

const WorkoutLogger: React.FC = () => {
  const { t, language, profile, refreshData } = useAppContext();
  
  // State
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsed, setElapsed] = useState(0);
  const [activeExercises, setActiveExercises] = useState<ActiveExercise[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  // Timer Effect
  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, startTime]);

  // Format Time MM:SS
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsActive(true);
    setStartTime(Date.now());
    setElapsed(0);
    setActiveExercises([]);
  };

  const handleAddExercise = (ex: Exercise) => {
    const newExercise: ActiveExercise = {
      instanceId: crypto.randomUUID(),
      exerciseDef: ex,
      sets: [
        { id: crypto.randomUUID(), weight: 20, reps: 10, completed: false }
      ]
    };
    setActiveExercises(prev => [...prev, newExercise]);
  };

  const addSet = (exerciseIndex: number) => {
    const exercise = activeExercises[exerciseIndex];
    const previousSet = exercise.sets[exercise.sets.length - 1];
    
    const newSet: ActiveSet = {
      id: crypto.randomUUID(),
      weight: previousSet ? previousSet.weight : 20,
      reps: previousSet ? previousSet.reps : 10,
      completed: false
    };

    const updated = [...activeExercises];
    updated[exerciseIndex].sets.push(newSet);
    setActiveExercises(updated);
  };

  const updateSet = (exIndex: number, setIndex: number, field: keyof ActiveSet, value: any) => {
    const updated = [...activeExercises];
    // @ts-ignore
    updated[exIndex].sets[setIndex][field] = value;
    setActiveExercises(updated);
  };

  const removeSet = (exIndex: number, setIndex: number) => {
     const updated = [...activeExercises];
     updated[exIndex].sets.splice(setIndex, 1);
     setActiveExercises(updated);
  };

  const handleFinish = async () => {
    if (activeExercises.length === 0) {
      setIsActive(false);
      return;
    }

    if (!confirm(language === 'zh' ? "确定结束训练并保存吗？" : "Finish and save workout?")) return;

    // Convert to WorkoutLog format
    let totalVol = 0;
    const exercisesLog: WorkoutExerciseLog[] = activeExercises.map(ae => {
      const setsLog: SetLog[] = ae.sets
        .filter(s => s.completed) // Only save completed sets? Or all? Let's save all but mark completion
        .map(s => {
          if (s.completed) totalVol += s.weight * s.reps;
          return {
            id: s.id,
            weight: s.weight,
            reps: s.reps,
            completed: s.completed,
            timestamp: Date.now()
          };
        });

      return {
        id: crypto.randomUUID(),
        exercise_id: ae.exerciseDef.id,
        sets: setsLog
      };
    });

    const log: WorkoutLog = {
      id: crypto.randomUUID(),
      user_id: profile.id, // This will be overwritten by storage service with actual auth ID usually
      name: language === 'zh' ? '自由训练' : 'Freestyle Workout',
      date: new Date().toISOString(),
      duration_minutes: Math.ceil(elapsed / 60),
      exercises: exercisesLog,
      total_volume: totalVol
    };

    await storage.saveWorkoutLog(log);
    refreshData(); // Refresh context to show new log in Dashboard
    setIsActive(false);
  };

  // --- Render Idle State ---
  if (!isActive) {
    return (
      <div className="p-4 pb-24 min-h-screen flex flex-col items-center justify-center text-center">
        <div className="bg-surface border border-border p-8 rounded-2xl max-w-sm w-full shadow-lg">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary animate-pulse">
            <Play size={32} fill="currentColor" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{t('workout', 'startTitle')}</h1>
          <p className="text-muted text-sm mb-8">{t('workout', 'startSubtitle')}</p>
          
          <button 
            onClick={handleStart}
            className="w-full py-4 bg-primary text-background font-bold text-lg rounded-xl hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]"
          >
            <Plus size={24} />
            {t('workout', 'startBtn')}
          </button>
        </div>
      </div>
    );
  }

  // --- Render Active State ---
  return (
    <div className="pb-24 min-h-screen bg-background relative">
      <ExercisePicker isOpen={showPicker} onClose={() => setShowPicker(false)} onSelect={handleAddExercise} />

      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Clock className="text-primary" size={20} />
          <span className="font-mono text-xl font-bold text-white tracking-widest">{formatTime(elapsed)}</span>
        </div>
        <button 
          onClick={handleFinish}
          className="bg-primary text-background px-4 py-1.5 rounded-full font-bold text-sm flex items-center gap-1 hover:bg-opacity-90"
        >
          <Save size={16} />
          {t('workout', 'finish')}
        </button>
      </div>

      {/* Exercise List */}
      <div className="p-4 space-y-6">
        {activeExercises.length === 0 && (
          <div className="text-center py-20 text-muted">
            <p>Tap "+" to add an exercise</p>
          </div>
        )}

        {activeExercises.map((ae, exIndex) => (
          <div key={ae.instanceId} className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
            {/* Exercise Header */}
            <div className="p-3 bg-zinc-800/50 border-b border-border flex justify-between items-center">
               <h3 className="font-bold text-white">
                 {language === 'zh' && ae.exerciseDef.name_zh ? ae.exerciseDef.name_zh : ae.exerciseDef.name}
               </h3>
               <button 
                onClick={() => {
                  const updated = [...activeExercises];
                  updated.splice(exIndex, 1);
                  setActiveExercises(updated);
                }}
                className="text-zinc-600 hover:text-red-400 p-1"
               >
                 <Trash2 size={16} />
               </button>
            </div>

            {/* Sets Header */}
            <div className="grid grid-cols-10 gap-2 px-3 py-2 text-[10px] text-muted font-bold uppercase tracking-wider text-center">
              <div className="col-span-1">#</div>
              <div className="col-span-3">{t('workout', 'kg')}</div>
              <div className="col-span-3">{t('workout', 'reps')}</div>
              <div className="col-span-3">Done</div>
            </div>

            {/* Sets Rows */}
            <div className="px-3 pb-3 space-y-2">
              {ae.sets.map((set, setIndex) => (
                <div key={set.id} className={`grid grid-cols-10 gap-2 items-center transition-opacity ${set.completed ? 'opacity-50' : 'opacity-100'}`}>
                  <div className="col-span-1 text-center text-sm font-bold text-zinc-500">{setIndex + 1}</div>
                  
                  <div className="col-span-3">
                    <input 
                      type="number" 
                      value={set.weight}
                      onChange={(e) => updateSet(exIndex, setIndex, 'weight', parseFloat(e.target.value))}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-1.5 text-center text-white font-mono focus:border-primary focus:outline-none"
                    />
                  </div>
                  
                  <div className="col-span-3">
                    <input 
                      type="number" 
                      value={set.reps}
                      onChange={(e) => updateSet(exIndex, setIndex, 'reps', parseFloat(e.target.value))}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-1.5 text-center text-white font-mono focus:border-primary focus:outline-none"
                    />
                  </div>
                  
                  <div className="col-span-3 flex justify-center">
                    <button 
                      onClick={() => updateSet(exIndex, setIndex, 'completed', !set.completed)}
                      className={`w-full h-9 rounded-lg flex items-center justify-center transition-colors ${
                        set.completed ? 'bg-primary text-background' : 'bg-zinc-800 text-zinc-600 hover:bg-zinc-700'
                      }`}
                    >
                      <Check size={18} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              ))}

              <button 
                onClick={() => addSet(exIndex)}
                className="w-full py-2 mt-2 text-xs font-medium text-muted bg-zinc-800/30 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors flex items-center justify-center gap-1"
              >
                <Plus size={14} /> {t('workout', 'addSet')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => setShowPicker(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-primary text-background rounded-full shadow-lg shadow-primary/30 flex items-center justify-center z-40 active:scale-90 transition-transform"
      >
        <Plus size={32} />
      </button>

    </div>
  );
};

export default WorkoutLogger;