
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { storage } from '../services/storageService';
import { Play, Plus, Search, Check, Trash2, Clock, Save, X, Timer, RotateCcw, ArrowDown, ChevronDown, Trophy } from 'lucide-react';
import { Exercise, WorkoutLog, WorkoutExerciseLog, SetLog, SetType } from '../types';

// Helper: Futuristic Exercise Picker
const ExercisePicker = ({ isOpen, onClose, onSelect }: { isOpen: boolean; onClose: () => void; onSelect: (ex: Exercise) => void }) => {
  const { exercises, language } = useAppContext();
  const [term, setTerm] = useState('');

  if (!isOpen) return null;

  const filtered = exercises.filter(e => {
    const name = language === 'zh' && e.name_zh ? e.name_zh : e.name;
    return name.toLowerCase().includes(term.toLowerCase());
  });

  return (
    <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-200">
      <div className="p-4 border-b border-white/10 flex items-center gap-3">
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={24} className="text-white" /></button>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-muted" size={18} />
          <input 
            autoFocus
            type="text"
            placeholder="SYSTEM_SEARCH_DB..."
            className="w-full bg-surface border border-transparent rounded-xl py-3 pl-10 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary font-mono text-sm"
            value={term}
            onChange={e => setTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filtered.map(ex => (
          <div 
            key={ex.id} 
            onClick={() => { onSelect(ex); onClose(); setTerm(''); }}
            className="glass-panel p-4 rounded-xl flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer hover:border-primary/50 group"
          >
            <div className="w-12 h-12 rounded-lg bg-black overflow-hidden border border-white/10">
              <img src={ex.image_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="" />
            </div>
            <div>
              <div className="font-bold text-sm text-white group-hover:text-primary transition-colors">{language === 'zh' && ex.name_zh ? ex.name_zh : ex.name}</div>
              <div className="text-[10px] font-mono text-muted uppercase tracking-wider">{ex.target_muscle}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Types
interface ActiveSet { id: string; type: SetType; weight: number; reps: number; completed: boolean; }
interface ActiveExercise { instanceId: string; exerciseDef: Exercise; sets: ActiveSet[]; }
type WorkoutStatus = 'idle' | 'planning' | 'active';

const WorkoutLogger: React.FC = () => {
  const { t, language, profile, refreshData } = useAppContext();
  const [status, setStatus] = useState<WorkoutStatus>('idle');
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsed, setElapsed] = useState(0); 
  const [restEndTime, setRestEndTime] = useState<number | null>(null);
  const [restRemaining, setRestRemaining] = useState(0);
  const [activeExercises, setActiveExercises] = useState<ActiveExercise[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);

  // Timers Logic
  useEffect(() => {
    let interval: any;
    if (status === 'active') {
      if (startTime === 0) setStartTime(Date.now());
      interval = setInterval(() => { setElapsed(Math.floor((Date.now() - startTime) / 1000)); }, 1000);
    }
    return () => clearInterval(interval);
  }, [status, startTime]);

  useEffect(() => {
    let interval: any;
    if (restEndTime) {
      interval = setInterval(() => {
        const left = Math.ceil((restEndTime - Date.now()) / 1000);
        if (left <= 0) { setRestRemaining(0); setRestEndTime(null); } 
        else { setRestRemaining(left); }
      }, 200);
    }
    return () => clearInterval(interval);
  }, [restEndTime]);

  // Formatters
  const formatTime = (sec: number) => {
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Actions
  const startPlanning = () => { setStatus('planning'); setActiveExercises([]); setElapsed(0); setStartTime(0); };
  const startActiveWorkout = () => { setStatus('active'); setStartTime(Date.now()); };
  
  const startRest = (seconds: number) => { 
    setRestEndTime(Date.now() + seconds * 1000); 
    setRestRemaining(seconds); 
  };
  
  const adjustRest = (delta: number) => {
    if (!restEndTime) return;
    const newEnd = restEndTime + (delta * 1000);
    setRestEndTime(newEnd);
    setRestRemaining(prev => Math.max(0, prev + delta));
  };

  const cancelRest = () => { setRestEndTime(null); setRestRemaining(0); };

  const handleAddExercise = (ex: Exercise) => {
    setActiveExercises(prev => [...prev, {
      instanceId: crypto.randomUUID(), 
      exerciseDef: ex, 
      sets: [{ id: crypto.randomUUID(), type: 'warmup', weight: 20, reps: 10, completed: false }]
    }]);
  };

  const addSet = (exerciseIndex: number) => {
    const exercise = activeExercises[exerciseIndex];
    const prev = exercise.sets[exercise.sets.length - 1];
    exercise.sets.push({ 
      id: crypto.randomUUID(), 
      type: 'working', // Default to working for subsequent sets
      weight: prev ? prev.weight : 20, 
      reps: prev ? prev.reps : 10, 
      completed: false 
    });
    setActiveExercises([...activeExercises]);
  };

  const updateSet = (exIndex: number, setIndex: number, field: keyof ActiveSet, value: any) => {
    const exercises = [...activeExercises];
    const set = exercises[exIndex].sets[setIndex];
    // @ts-ignore
    set[field] = value;
    
    // Auto-trigger rest logic
    if (field === 'completed' && value === true && status === 'active') {
       const restTime = set.type === 'warmup' ? 30 : 60;
       startRest(restTime);
    }

    setActiveExercises(exercises);
  };

  const batchSync = (exIndex: number) => {
    const exercises = [...activeExercises];
    const firstSet = exercises[exIndex].sets[0];
    if (!firstSet) return;
    
    exercises[exIndex].sets.forEach((set, idx) => {
      if (idx > 0 && !set.completed) {
        set.weight = firstSet.weight;
        set.reps = firstSet.reps;
      }
    });
    setActiveExercises(exercises);
  };

  const toggleSetType = (exIndex: number, setIndex: number) => {
    const exercises = [...activeExercises];
    const set = exercises[exIndex].sets[setIndex];
    set.type = set.type === 'warmup' ? 'working' : 'warmup';
    setActiveExercises(exercises);
  };

  const handleFinish = async () => {
    if (activeExercises.length === 0) { setStatus('idle'); return; }
    
    let totalVol = 0;
    const exercisesLog: WorkoutExerciseLog[] = activeExercises.map(ae => ({
      id: crypto.randomUUID(),
      exercise_id: ae.exerciseDef.id,
      sets: ae.sets.filter(s => s.completed).map(s => {
        if (s.completed) totalVol += s.weight * s.reps;
        return { 
          id: s.id, 
          type: s.type,
          weight: s.weight, 
          reps: s.reps, 
          completed: s.completed, 
          timestamp: Date.now() 
        };
      })
    }));

    await storage.saveWorkoutLog({
      id: crypto.randomUUID(), user_id: profile.id, name: 'Cyber Workout',
      date: new Date().toISOString(), duration_minutes: Math.max(1, Math.ceil(elapsed / 60)),
      exercises: exercisesLog, total_volume: totalVol
    });
    
    setShowFinishModal(true);
    refreshData();
  };

  const closeFinishModal = () => {
    setShowFinishModal(false);
    setStatus('idle'); 
    setElapsed(0); 
    setStartTime(0); 
    setRestEndTime(null);
  };

  // --- IDLE VIEW ---
  if (status === 'idle') {
    return (
      <div className="p-6 pb-24 min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent animate-pulse-slow"></div>
        <div className="glass-panel p-8 rounded-3xl w-full max-w-sm border border-primary/20 relative z-10 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary shadow-[0_0_30px_rgba(204,255,0,0.2)]">
            <Play size={40} fill="currentColor" />
          </div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter mb-2">{t('workout', 'startTitle')}</h1>
          <p className="text-muted text-xs font-mono mb-8">INITIATE_TRAINING_SEQUENCE_V2.0</p>
          <button onClick={startPlanning} className="w-full py-4 bg-primary text-black font-black text-lg rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(204,255,0,0.4)] tracking-widest uppercase">
            {t('workout', 'planTitle')}
          </button>
        </div>
      </div>
    );
  }

  // --- ACTIVE/PLANNING VIEW ---
  return (
    <div className="pb-32 min-h-screen relative">
      <ExercisePicker isOpen={showPicker} onClose={() => setShowPicker(false)} onSelect={handleAddExercise} />

      {/* Header / Timer */}
      <div className={`sticky top-0 z-40 p-4 transition-all duration-500 ${status === 'active' ? 'bg-background/90 backdrop-blur-xl border-b border-primary/20' : 'bg-background/80 backdrop-blur-md'}`}>
        <div className="flex justify-between items-center">
          {status === 'planning' ? (
             <div><h1 className="font-bold text-white uppercase tracking-wider">{t('workout', 'planTitle')}</h1><p className="text-[10px] text-muted font-mono">ADD_EXERCISES</p></div>
          ) : (
             <div className="flex flex-col">
               <span className="text-[10px] text-primary font-mono tracking-[0.2em] animate-pulse">SESSION_TIME</span>
               <span className="text-4xl font-black text-white font-mono leading-none tracking-tighter">{formatTime(elapsed)}</span>
             </div>
          )}
          
          {status === 'planning' ? (
             <button onClick={startActiveWorkout} disabled={activeExercises.length === 0} className="bg-primary text-black px-6 py-2 rounded-full font-bold text-sm shadow-[0_0_15px_rgba(204,255,0,0.4)] disabled:opacity-50">
               START
             </button>
          ) : (
             <button onClick={handleFinish} className="bg-surface border border-white/20 text-white px-4 py-2 rounded-lg font-mono text-xs hover:bg-white/10">
               {t('workout', 'finish')}
             </button>
          )}
        </div>
      </div>

      {/* Full Screen Rest Overlay */}
      {status === 'active' && restRemaining > 0 && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="text-primary font-bold text-lg uppercase tracking-[0.2em] mb-8 animate-pulse">Resting</div>
           
           <div className="relative mb-12">
             <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
             <span className="relative font-mono text-9xl font-black text-white tabular-nums tracking-tighter drop-shadow-[0_0_15px_rgba(204,255,0,0.5)]">
                {formatTime(restRemaining)}
             </span>
           </div>

           <div className="flex gap-6 mb-12">
              <button onClick={() => adjustRest(-10)} className="w-16 h-16 rounded-full border border-white/20 text-white font-bold hover:bg-white/10 transition-colors">-10</button>
              <button onClick={() => adjustRest(10)} className="w-16 h-16 rounded-full border border-white/20 text-white font-bold hover:bg-white/10 transition-colors">+10</button>
           </div>

           <button onClick={cancelRest} className="px-8 py-3 bg-white/10 text-white rounded-full font-bold hover:bg-white/20 transition-all">
             {t('workout', 'skip')}
           </button>
        </div>
      )}

      {/* Completion Modal */}
      {showFinishModal && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
            <div className="bg-surface border border-primary/30 w-full max-w-sm rounded-3xl p-8 text-center shadow-[0_0_50px_rgba(204,255,0,0.2)]">
               <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary border border-primary/50">
                  <Trophy size={40} />
               </div>
               <h2 className="text-2xl font-black text-white italic mb-2">{t('workout', 'finishModalTitle')}</h2>
               <p className="text-muted text-sm mb-8">{t('workout', 'finishModalBody')}</p>
               <button onClick={closeFinishModal} className="w-full py-4 bg-primary text-black font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-transform">
                 {t('workout', 'close')}
               </button>
            </div>
         </div>
      )}

      {/* List */}
      <div className="p-4 space-y-6">
        {activeExercises.map((ae, exIndex) => (
          <div key={ae.instanceId} className={`glass-panel rounded-2xl overflow-hidden transition-all ${status === 'active' ? 'border-l-4 border-l-primary/50' : ''}`}>
            {/* Header */}
            <div className="p-4 flex justify-between items-center bg-white/5">
               <h3 className="font-bold text-white text-lg tracking-tight">{language === 'zh' && ae.exerciseDef.name_zh ? ae.exerciseDef.name_zh : ae.exerciseDef.name}</h3>
               <button onClick={() => { const up = [...activeExercises]; up.splice(exIndex, 1); setActiveExercises(up); }} className="text-zinc-600 hover:text-red-500"><Trash2 size={18} /></button>
            </div>

            {/* Grid Header */}
            <div className="grid grid-cols-10 gap-2 px-4 py-2 text-[10px] text-muted font-bold uppercase tracking-wider text-center items-center">
              <div className="col-span-1">Type</div>
              <div className="col-span-3 flex items-center justify-center gap-1">
                 KG 
                 <button onClick={() => batchSync(exIndex)} className="text-primary hover:text-white" title={t('workout', 'batchSync')}><ArrowDown size={12} /></button>
              </div>
              <div className="col-span-3">REPS</div>
              <div className="col-span-3">CHECK</div>
            </div>

            {/* Sets */}
            <div className="px-4 pb-4 space-y-2">
              {ae.sets.map((set, setIndex) => (
                <div key={set.id} className={`grid grid-cols-10 gap-2 items-center transition-all ${set.completed ? 'opacity-40' : ''}`}>
                  {/* Type Toggle */}
                  <div className="col-span-1 flex justify-center">
                    <button 
                      onClick={() => toggleSetType(exIndex, setIndex)}
                      className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold border ${set.type === 'warmup' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50' : 'bg-primary/20 text-primary border-primary/50'}`}
                    >
                      {set.type === 'warmup' ? t('workout', 'warmup') : t('workout', 'working')}
                    </button>
                  </div>
                  
                  <div className="col-span-3">
                    <input type="number" value={set.weight} onChange={(e) => updateSet(exIndex, setIndex, 'weight', parseFloat(e.target.value))} className="w-full text-center py-2 rounded-lg text-white font-mono font-bold text-lg" />
                  </div>
                  <div className="col-span-3">
                    <input type="number" value={set.reps} onChange={(e) => updateSet(exIndex, setIndex, 'reps', parseFloat(e.target.value))} className="w-full text-center py-2 rounded-lg text-white font-mono font-bold text-lg" />
                  </div>
                  <div className="col-span-3 flex justify-center">
                    {status === 'active' ? (
                       !set.completed ? (
                          <button onClick={() => updateSet(exIndex, setIndex, 'completed', true)} className="w-full h-10 rounded-lg bg-surface border border-white/10 hover:border-primary hover:text-primary transition-all flex items-center justify-center group">
                            <Check size={20} className="group-hover:drop-shadow-[0_0_5px_rgba(204,255,0,1)]" />
                          </button>
                       ) : (
                          <button onClick={() => updateSet(exIndex, setIndex, 'completed', false)} className="w-full h-10 rounded-lg bg-green-900/20 text-green-500 border border-green-500/30 flex items-center justify-center">
                             <RotateCcw size={16} />
                          </button>
                       )
                    ) : (
                      <div className="w-full h-10 rounded-lg bg-white/5"></div>
                    )}
                  </div>
                </div>
              ))}
              <button onClick={() => addSet(exIndex)} className="w-full py-3 mt-2 text-xs font-bold text-muted bg-black/20 rounded-lg hover:bg-black/40 hover:text-white transition-colors uppercase tracking-widest border border-dashed border-white/10 hover:border-white/20">
                + {t('workout', 'addSet')}
              </button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => setShowPicker(true)} className="fixed bottom-28 right-6 w-16 h-16 bg-primary text-black rounded-full shadow-[0_0_30px_rgba(204,255,0,0.4)] flex items-center justify-center z-40 active:scale-90 transition-transform hover:scale-105 border-4 border-black">
        <Plus size={32} strokeWidth={3} />
      </button>
    </div>
  );
};

export default WorkoutLogger;
