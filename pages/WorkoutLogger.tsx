import React, { useState, useEffect } from 'react';
import { storage } from '../services/storageService';
import { Exercise, SetLog } from '../types';
import { Plus, Check, Timer, MoreVertical, Play, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';

interface ActiveSet extends SetLog {
  isNew?: boolean;
}

interface ActiveExercise {
  exercise: Exercise;
  sets: ActiveSet[];
}

const WorkoutLogger: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useAppContext();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [activeExercises, setActiveExercises] = useState<ActiveExercise[]>([]);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const allExercises = storage.getExercises();

  // Helper for exercise name
  const getExerciseName = (ex: any) => {
    return language === 'zh' && ex.name_zh ? ex.name_zh : ex.name;
  };

  // Timer logic
  useEffect(() => {
    let interval: any;
    if (isWorkoutActive) {
      interval = setInterval(() => setElapsedTime(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isWorkoutActive]);

  useEffect(() => {
    let interval: any;
    if (restTimer > 0) {
      interval = setInterval(() => setRestTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [restTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startWorkout = () => {
    // Add default routine for demo
    const defaultExercises = [allExercises[0], allExercises[1]]; // Squat & Bench
    setActiveExercises(defaultExercises.map(ex => ({
      exercise: ex,
      sets: [
        { id: Math.random().toString(), weight: 60, reps: 10, completed: false, timestamp: 0 },
        { id: Math.random().toString(), weight: 60, reps: 10, completed: false, timestamp: 0 },
        { id: Math.random().toString(), weight: 60, reps: 10, completed: false, timestamp: 0 },
      ]
    })));
    setIsWorkoutActive(true);
  };

  const toggleSet = (exerciseIndex: number, setIndex: number) => {
    const newExercises = [...activeExercises];
    const set = newExercises[exerciseIndex].sets[setIndex];
    
    set.completed = !set.completed;
    set.timestamp = Date.now();
    
    if (set.completed) {
      setRestTimer(180); // 3 min standard rest
    } else {
      setRestTimer(0);
    }

    setActiveExercises(newExercises);
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps' | 'rpe', value: number) => {
    const newExercises = [...activeExercises];
    newExercises[exerciseIndex].sets[setIndex] = {
      ...newExercises[exerciseIndex].sets[setIndex],
      [field]: value
    };
    setActiveExercises(newExercises);
  };

  const finishWorkout = () => {
    if (activeExercises.length === 0) return;
    
    const totalVol = activeExercises.reduce((acc, ex) => {
      return acc + ex.sets.filter(s => s.completed).reduce((sAcc, s) => sAcc + (s.weight * s.reps), 0);
    }, 0);

    const log = {
      id: Math.random().toString(),
      user_id: 'u_1',
      name: 'Full Body Power',
      date: new Date().toISOString(),
      duration_minutes: Math.floor(elapsedTime / 60),
      exercises: [], // Mapped properly in real app
      total_volume: totalVol
    };

    storage.saveWorkoutLog(log);
    setIsWorkoutActive(false);
    navigate('/');
  };

  if (!isWorkoutActive) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] p-6 text-center">
        <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-6 border border-border">
          <DumbbellIcon size={40} className="text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">{t('workout', 'startTitle')}</h1>
        <p className="text-muted mb-8">{t('workout', 'startSubtitle')}</p>
        
        <button 
          onClick={startWorkout}
          className="w-full max-w-xs bg-primary hover:bg-emerald-600 text-background font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
        >
          <Play fill="currentColor" size={20} />
          {t('workout', 'startBtn')}
        </button>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border p-3 flex justify-between items-center">
        <div>
          <div className="text-xs text-muted font-mono">{formatTime(elapsedTime)}</div>
          <h2 className="text-white font-bold">Full Body A</h2>
        </div>
        <div className="flex gap-3">
          {restTimer > 0 && (
             <div className="bg-secondary/10 text-secondary px-3 py-1.5 rounded-md text-sm font-mono flex items-center gap-1.5 animate-pulse border border-secondary/20">
               <Timer size={14} />
               {formatTime(restTimer)}
             </div>
          )}
          <button 
            onClick={finishWorkout}
            className="bg-primary text-background px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-opacity-90 flex items-center gap-1"
          >
            <Save size={16} /> {t('workout', 'finish')}
          </button>
        </div>
      </div>

      <div className="p-3 space-y-4">
        {activeExercises.map((exData, exIdx) => {
            const history = storage.getLastLogForExercise(exData.exercise.id);
            return (
              <div key={exData.exercise.id} className="bg-surface rounded-xl overflow-hidden border border-border">
                <div className="p-3 border-b border-border bg-zinc-900/50 flex justify-between items-center">
                  <h3 className="text-blue-400 font-semibold">{getExerciseName(exData.exercise)}</h3>
                  <button className="text-muted p-1"><MoreVertical size={16} /></button>
                </div>
                
                {/* Header Row */}
                <div className="grid grid-cols-10 gap-2 p-2 text-xs text-muted font-medium text-center uppercase tracking-wider">
                  <div className="col-span-1">{t('workout', 'set')}</div>
                  <div className="col-span-3">{t('workout', 'previous')}</div>
                  <div className="col-span-2">{t('workout', 'kg')}</div>
                  <div className="col-span-2">{t('workout', 'reps')}</div>
                  <div className="col-span-2">{t('workout', 'done')}</div>
                </div>

                <div className="flex flex-col">
                  {exData.sets.map((set, sIdx) => {
                    const prevSet = history?.sets[sIdx];
                    return (
                      <div key={set.id} className={`grid grid-cols-10 gap-2 p-2 items-center ${set.completed ? 'bg-primary/5' : ''}`}>
                        <div className="col-span-1 flex justify-center">
                          <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-muted">
                            {sIdx + 1}
                          </div>
                        </div>
                        
                        {/* History Ref */}
                        <div className="col-span-3 text-center text-xs text-zinc-500">
                          {prevSet ? `${prevSet.weight}kg x ${prevSet.reps}` : '-'}
                        </div>

                        {/* Input: Weight */}
                        <div className="col-span-2">
                          <input 
                            type="number" 
                            className={`w-full bg-zinc-900 border ${set.completed ? 'border-primary/30 text-primary' : 'border-zinc-700 text-white'} rounded text-center py-1.5 font-bold focus:outline-none focus:border-primary`}
                            value={set.weight}
                            onChange={(e) => updateSet(exIdx, sIdx, 'weight', Number(e.target.value))}
                          />
                        </div>

                        {/* Input: Reps */}
                        <div className="col-span-2">
                           <input 
                            type="number" 
                            className={`w-full bg-zinc-900 border ${set.completed ? 'border-primary/30 text-primary' : 'border-zinc-700 text-white'} rounded text-center py-1.5 font-bold focus:outline-none focus:border-primary`}
                            value={set.reps}
                            onChange={(e) => updateSet(exIdx, sIdx, 'reps', Number(e.target.value))}
                          />
                        </div>

                        {/* Check Button */}
                        <div className="col-span-2 flex justify-center">
                          <button 
                            onClick={() => toggleSet(exIdx, sIdx)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                              set.completed 
                              ? 'bg-primary text-background shadow-[0_0_10px_rgba(34,197,94,0.4)]' 
                              : 'bg-zinc-800 text-muted hover:bg-zinc-700'
                            }`}
                          >
                            <Check size={18} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <button className="w-full py-3 text-xs font-bold text-primary uppercase hover:bg-primary/5 transition-colors flex items-center justify-center gap-1">
                  <Plus size={14} /> {t('workout', 'addSet')}
                </button>
              </div>
            );
        })}
        
        <button className="w-full py-4 border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500 font-bold hover:border-zinc-600 hover:text-zinc-400 transition-all flex items-center justify-center gap-2">
          <Plus size={18} /> {t('workout', 'addExercise')}
        </button>
      </div>
    </div>
  );
};

const DumbbellIcon = ({size, className}: {size:number, className?:string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>
);

export default WorkoutLogger;