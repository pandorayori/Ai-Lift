
import React, { useMemo, useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Zap, Scale, Calendar, RefreshCw, ChevronRight, TrendingUp, Sparkles, Check, PlayCircle, AlertCircle, CalendarCheck, Clock, ShieldAlert, Dumbbell, X, Info, Target } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { Link, useNavigate } from 'react-router-dom';
import { generateWorkoutPlan } from '../services/geminiService';
import { storage } from '../services/storageService';
import { WorkoutPlan, PlanGoal, SplitType, TrainingLevel, Equipment, PlanDay } from '../types';

// ... (Keep existing StatCard and WeeklySchedule components) ...
const StatCard = ({ title, value, unit, icon: Icon, colorClass, to }: any) => {
  const CardContent = (
    <div className="glass-card rounded-2xl p-4 flex flex-col justify-between h-28 relative overflow-hidden group hover:border-white/10 transition-all">
      <div className={`absolute -right-4 -top-4 w-20 h-20 bg-gradient-to-br ${colorClass.replace('text-', 'from-')}/20 to-transparent rounded-full blur-xl group-hover:blur-2xl transition-all duration-500`} />
      
      <div className="flex justify-between items-start z-10">
        <Icon className={`${colorClass} drop-shadow-md`} size={20} />
        {unit === 'kg' && <TrendingUp size={14} className="text-primary/50" />}
      </div>
      
      <div className="z-10">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold font-mono text-white tracking-tight">{value}</span>
          {unit && <span className="text-xs text-muted font-medium">{unit}</span>}
        </div>
        <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1 opacity-70">{title}</p>
      </div>
    </div>
  );

  return to ? <Link to={to} className="block active:scale-95 transition-transform">{CardContent}</Link> : CardContent;
};

const WeeklySchedule = ({ plan, onDayClick }: { plan: WorkoutPlan, onDayClick: (day: PlanDay) => void }) => {
  const { t } = useAppContext();
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1; // 0=Mon, 6=Sun

  return (
    <div className="grid grid-cols-7 gap-1.5 mt-4">
      {plan.schedule.map((day, idx) => {
        const isToday = idx === todayIndex;
        const isRest = day.is_rest;
        
        return (
          <button 
            key={idx}
            onClick={() => onDayClick(day)}
            className={`
              flex flex-col items-center justify-center py-3 rounded-xl border transition-all relative overflow-hidden
              ${isToday ? 'border-primary bg-primary/10' : 'border-white/5 bg-black/20 hover:bg-white/5'}
            `}
          >
            {isToday && <div className="absolute top-0 w-full h-0.5 bg-primary shadow-[0_0_10px_#CCFF00]"></div>}
            
            <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isToday ? 'text-primary' : 'text-zinc-500'}`}>
              {['M','T','W','T','F','S','S'][idx]}
            </span>
            
            <div className={`
              w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold
              ${isRest 
                 ? 'bg-zinc-800 text-zinc-500' 
                 : (isToday ? 'bg-primary text-black' : 'bg-secondary/20 text-secondary border border-secondary/30')}
            `}>
              {isRest ? 'R' : day.day_number}
            </div>
          </button>
        );
      })}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { profile, t, logs, isSyncing, refreshData } = useAppContext();
  const navigate = useNavigate();
  const [showPlanWizard, setShowPlanWizard] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDay, setSelectedDay] = useState<PlanDay | null>(null);
  const [activePlan, setActivePlan] = useState<WorkoutPlan | null>(storage.getActivePlan());

  // --- Scroll Lock Effect ---
  useEffect(() => {
    if (showPlanWizard || selectedDay) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showPlanWizard, selectedDay]);

  // --- Wizard States ---
  const [wizStep, setWizStep] = useState(1);
  const [planGoal, setPlanGoal] = useState<PlanGoal>('hypertrophy');
  const [planLevel, setPlanLevel] = useState<TrainingLevel>('intermediate');
  const [planSplit, setPlanSplit] = useState<SplitType>('ppl');
  const [planDays, setPlanDays] = useState(4);
  const [planDuration, setPlanDuration] = useState(60);
  const [planSpotter, setPlanSpotter] = useState(false);
  const [planEquipment, setPlanEquipment] = useState<Equipment[]>(['free_weights', 'machines', 'bodyweight']);
  const [planInjuries, setPlanInjuries] = useState<string[]>([]);
  // Advanced Params
  const [planWeakPoint, setPlanWeakPoint] = useState('');
  const [planMaxDB, setPlanMaxDB] = useState<number | undefined>(undefined);

  const volumeData = useMemo(() => {
    const sorted = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sorted.slice(-10).map(log => ({
      date: new Date(log.date).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }),
      volume: Math.round(log.total_volume)
    }));
  }, [logs]);

  const recentVolume = logs.length > 0 ? logs[logs.length - 1].total_volume : 0;
  const totalWorkouts = logs.length;

  const toggleArrayItem = <T,>(item: T, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
    setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    const plan = await generateWorkoutPlan({
      goal: planGoal,
      level: planLevel,
      split: planSplit,
      days: planDays,
      equipment: planEquipment,
      injuries: planInjuries,
      hiddenParams: {
        session_duration_min: planDuration,
        has_spotter: planSpotter,
        weak_point_focus: planWeakPoint,
        max_dumbbell_weight_kg: planMaxDB
      }
    }, profile);

    if (plan) {
      storage.saveActivePlan(plan);
      setActivePlan(plan);
      setShowPlanWizard(false);
      refreshData();
    }
    setIsGenerating(false);
  };

  return (
    <div className="p-5 pb-32 space-y-6">
      
      {/* Header */}
      <header className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter italic">
            AI-LIFT <span className="text-primary">OS</span>
          </h1>
          <p className="text-muted text-xs font-mono mt-1 flex items-center gap-2">
            STATUS: <span className="text-primary">ONLINE</span>
            {isSyncing && <RefreshCw className="animate-spin text-primary" size={10} />}
          </p>
        </div>
        <Link to="/profile">
           <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${profile.avatar || 'from-primary to-emerald-400'} border border-white/10 flex items-center justify-center text-black font-bold shadow-[0_0_15px_rgba(204,255,0,0.2)] hover:scale-105 transition-transform`}>
               {profile.name[0]}
           </div>
        </Link>
      </header>

      {/* AI PLAN CENTER */}
      {activePlan ? (
        <div className="glass-panel p-5 rounded-3xl border border-primary/30 relative overflow-hidden group z-10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -translate-y-10 translate-x-10"></div>
          
          {/* Main Card Header */}
          <div className="relative z-10">
             <div className="flex justify-between items-start mb-2">
               <div>
                 <div className="flex items-center gap-2 mb-1">
                   <Sparkles size={14} className="text-primary animate-pulse" />
                   <span className="text-[10px] font-bold tracking-widest text-primary uppercase">{t('dashboard', 'activePlan')}</span>
                 </div>
                 <h2 className="text-lg font-bold text-white leading-tight">{activePlan.name}</h2>
               </div>
               <button 
                onClick={() => setShowPlanWizard(true)}
                className="p-2 bg-black/20 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors"
               >
                 <RefreshCw size={14} />
               </button>
             </div>

             {/* Schedule View */}
             <WeeklySchedule plan={activePlan} onDayClick={setSelectedDay} />
             
             {/* Today's Context Action */}
             <div className="mt-4 pt-4 border-t border-white/5">
                <button onClick={() => navigate('/workout')} className="w-full py-3 bg-primary text-black font-black uppercase tracking-widest rounded-xl hover:bg-white transition-colors shadow-[0_0_15px_rgba(204,255,0,0.3)] flex items-center justify-center gap-2">
                  <PlayCircle size={18} fill="currentColor" className="text-black" />
                  {t('plan', 'startDay')}
                </button>
             </div>
          </div>
        </div>
      ) : (
        <div onClick={() => setShowPlanWizard(true)} className="glass-panel p-6 rounded-3xl border border-white/10 border-dashed relative overflow-hidden group cursor-pointer hover:bg-white/5 transition-colors z-10">
           <div className="flex flex-col items-center justify-center py-6 text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center text-secondary border border-secondary/30 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                 <Sparkles size={32} />
              </div>
              <div>
                 <h2 className="text-xl font-bold text-white mb-1">{t('dashboard', 'planGenerator')}</h2>
                 <p className="text-xs text-muted max-w-[200px] mx-auto">Create a professional, periodized training microcycle in seconds.</p>
              </div>
              <div className="px-6 py-2 bg-secondary text-white text-xs font-bold rounded-full mt-2">
                 {t('dashboard', 'generateBtn')}
              </div>
           </div>
        </div>
      )}

      {/* PLAN WIZARD MODAL (Multi-Step) */}
      {showPlanWizard && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="w-full max-w-md bg-surface border border-white/10 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] h-[85vh]">
              {/* Wizard Header */}
              <div className="p-5 border-b border-white/10 flex justify-between items-center bg-black/40 shrink-0">
                 <div>
                   <h2 className="font-bold text-white flex items-center gap-2">
                     <Sparkles size={16} className="text-primary" />
                     {t('plan', 'title')}
                   </h2>
                   <div className="text-[10px] text-muted uppercase tracking-widest mt-1">Step {wizStep} / 3</div>
                 </div>
                 <button onClick={() => setShowPlanWizard(false)} className="text-muted hover:text-white p-2 bg-white/5 rounded-full"><X size={18} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-5 space-y-8">
                 {/* STEP 1: CORE PARAMS */}
                 {wizStep === 1 && (
                   <div className="space-y-6 animate-in slide-in-from-right duration-300">
                      {/* Goal */}
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-primary uppercase tracking-wider">{t('plan', 'goal')}</label>
                        <div className="grid grid-cols-2 gap-2">
                          {['hypertrophy', 'strength', 'fat_loss', 'power', 'posture', 'conditioning', 'sport_specific', 'rehab'].map(g => (
                            <button key={g} onClick={() => setPlanGoal(g as PlanGoal)} className={`p-3 rounded-xl border text-left transition-all ${planGoal === g ? 'bg-primary/20 border-primary text-white' : 'bg-black/20 border-white/5 text-zinc-500'}`}>
                              <div className="font-bold text-[10px] uppercase truncate">{t('plan', g as any)}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Level */}
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-primary uppercase tracking-wider">{t('plan', 'level')}</label>
                        <div className="flex flex-col gap-2">
                          {['novice', 'intermediate', 'advanced', 'elite'].map(l => (
                             <button key={l} onClick={() => setPlanLevel(l as TrainingLevel)} className={`px-4 py-3 rounded-lg border text-xs font-bold text-left transition-all ${planLevel === l ? 'bg-secondary/20 border-secondary text-white' : 'bg-black/20 border-white/5 text-zinc-500'}`}>
                               {t('plan', l as any)}
                             </button>
                          ))}
                        </div>
                      </div>

                      {/* Days */}
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-primary uppercase tracking-wider">{t('plan', 'days')}: <span className="text-white text-lg">{planDays}</span></label>
                        <input type="range" min="1" max="7" value={planDays} onChange={(e) => setPlanDays(parseInt(e.target.value))} className="w-full accent-primary h-2 bg-white/10 rounded-lg appearance-none" />
                        <div className="flex justify-between text-[10px] text-zinc-600 font-mono"><span>1</span><span>7</span></div>
                      </div>
                   </div>
                 )}

                 {/* STEP 2: STRATEGY */}
                 {wizStep === 2 && (
                   <div className="space-y-6 animate-in slide-in-from-right duration-300">
                      {/* Split */}
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-primary uppercase tracking-wider">{t('plan', 'split')}</label>
                        <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2">
                          {['full_body', 'upper_lower', 'ppl', 'bro_split', 'ppl_6', 'ul_hybrid', 'active_recovery'].map(s => (
                            <button key={s} onClick={() => setPlanSplit(s as SplitType)} className={`p-3 rounded-xl border text-left transition-all ${planSplit === s ? 'bg-accent/20 border-accent text-white' : 'bg-black/20 border-white/5 text-zinc-500'}`}>
                              <div className="font-bold text-xs">{t('plan', s as any)}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Hidden Params */}
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-4">
                        <h3 className="text-xs font-bold text-muted uppercase flex items-center gap-2"><Clock size={12}/> {t('plan', 'hidden')}</h3>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-zinc-400">
                            <span>{t('plan', 'duration')}</span>
                            <span>{planDuration} min</span>
                          </div>
                          <input type="range" min="30" max="120" step="15" value={planDuration} onChange={(e) => setPlanDuration(parseInt(e.target.value))} className="w-full accent-zinc-500 h-1 bg-white/10 rounded-lg appearance-none" />
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-zinc-400">{t('plan', 'spotter')}</span>
                          <button onClick={() => setPlanSpotter(!planSpotter)} className={`w-10 h-5 rounded-full relative transition-colors ${planSpotter ? 'bg-green-500' : 'bg-zinc-700'}`}>
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${planSpotter ? 'left-6' : 'left-1'}`} />
                          </button>
                        </div>
                        
                        {/* Advanced: Weak Point */}
                        <div className="space-y-2 pt-2 border-t border-white/5">
                           <label className="text-xs text-zinc-400 flex items-center gap-2"><Target size={12} /> {t('plan', 'weakPoint')}</label>
                           <input type="text" value={planWeakPoint} onChange={(e) => setPlanWeakPoint(e.target.value)} placeholder="e.g. Upper Chest, Side Delts" className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-white/30" />
                        </div>
                        
                        {/* Advanced: Max Dumbbell (only if Home/Free weights) */}
                        {(planEquipment.includes('free_weights') || planEquipment.includes('bands') || planEquipment.includes('kettlebells')) && (
                          <div className="space-y-2">
                             <label className="text-xs text-zinc-400 flex items-center gap-2"><Dumbbell size={12} /> {t('plan', 'maxDumbbell')}</label>
                             <div className="flex items-center gap-2">
                                <input type="number" value={planMaxDB || ''} onChange={(e) => setPlanMaxDB(parseFloat(e.target.value))} placeholder="∞" className="flex-1 bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-white/30" />
                                <span className="text-xs text-muted">kg</span>
                             </div>
                          </div>
                        )}
                      </div>
                   </div>
                 )}

                 {/* STEP 3: LOGISTICS */}
                 {wizStep === 3 && (
                    <div className="space-y-6 animate-in slide-in-from-right duration-300">
                       {/* Equipment */}
                       <div className="space-y-3">
                         <label className="text-xs font-bold text-primary uppercase tracking-wider">{t('plan', 'equipment')}</label>
                         <div className="flex flex-wrap gap-2">
                           {['free_weights', 'machines', 'cables', 'bodyweight', 'bands', 'kettlebells', 'squat_rack', 'cardio_machine'].map(eq => (
                             <button key={eq} onClick={() => toggleArrayItem(eq as Equipment, setPlanEquipment)} className={`px-3 py-2 rounded-lg border text-[10px] font-bold transition-all ${planEquipment.includes(eq as Equipment) ? 'bg-white text-black border-white' : 'bg-black/20 border-white/5 text-zinc-500'}`}>
                               {t('plan', eq as any)}
                             </button>
                           ))}
                         </div>
                       </div>

                       {/* Injuries */}
                       <div className="space-y-3">
                          <label className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2"><ShieldAlert size={12}/> {t('plan', 'injuries')}</label>
                          <div className="flex flex-wrap gap-2">
                             {['shoulder', 'knee', 'back', 'elbow', 'wrist', 'core'].map(inj => (
                               <button key={inj} onClick={() => toggleArrayItem(inj, setPlanInjuries)} className={`px-3 py-2 rounded-lg border text-[10px] font-bold transition-all ${planInjuries.includes(inj) ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-black/20 border-white/5 text-zinc-500'}`}>
                                 {t('plan', inj as any)}
                               </button>
                             ))}
                          </div>
                       </div>
                    </div>
                 )}
              </div>

              {/* Wizard Footer */}
              <div className="p-5 border-t border-white/10 bg-black/40 flex gap-3 shrink-0">
                 {wizStep > 1 && (
                   <button onClick={() => setWizStep(p => p - 1)} className="px-6 py-3 bg-zinc-800 text-white font-bold rounded-xl text-sm">Back</button>
                 )}
                 
                 {wizStep < 3 ? (
                   <button onClick={() => setWizStep(p => p + 1)} className="flex-1 py-3 bg-white text-black font-bold rounded-xl text-sm hover:bg-zinc-200">Next Step</button>
                 ) : (
                   <button onClick={handleGenerate} disabled={isGenerating} className="flex-1 py-3 bg-primary text-black font-black uppercase tracking-widest rounded-xl hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                     {isGenerating ? <><RefreshCw className="animate-spin" /> Generating...</> : t('plan', 'confirmGenerate')}
                   </button>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* DAY DETAIL MODAL */}
      {selectedDay && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedDay(null)}>
           <div className="w-full max-w-sm bg-surface border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                 <div>
                    <h3 className="text-xl font-bold text-white">Day {selectedDay.day_number}</h3>
                    <p className="text-primary text-sm font-medium">{selectedDay.focus}</p>
                 </div>
                 <button onClick={() => setSelectedDay(null)} className="p-2 bg-white/5 rounded-full text-muted"><X size={18}/></button>
              </div>

              {selectedDay.is_rest ? (
                 <div className="py-8 text-center bg-black/20 rounded-xl border border-white/5">
                    <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-3 text-zinc-500">
                       <Clock size={32} />
                    </div>
                    <h4 className="text-white font-bold">{t('plan', 'restDay')}</h4>
                    <p className="text-xs text-muted mt-2 px-4">Focus on recovery, nutrition, and sleep today.</p>
                 </div>
              ) : (
                 <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                    {selectedDay.exercises.map((ex, idx) => (
                       <div key={idx} className="bg-black/20 p-3 rounded-lg border border-white/5 flex gap-3 items-center">
                          <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-xs font-mono text-zinc-400 shrink-0">
                             {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                             <div className="text-sm font-bold text-white truncate">{ex.name}</div>
                             <div className="text-[10px] text-zinc-400 flex gap-2">
                                <span>{ex.sets} Sets</span>
                                <span>{ex.reps} Reps</span>
                             </div>
                             {ex.notes && <div className="text-[10px] text-primary/70 mt-1 italic">{ex.notes}</div>}
                          </div>
                       </div>
                    ))}
                 </div>
              )}
           </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard title={t('dashboard', 'workouts')} value={totalWorkouts} unit="" icon={Calendar} colorClass="text-accent" to="/history" />
        <StatCard title={t('dashboard', 'lastVolume')} value={(recentVolume / 1000).toFixed(1)} unit="k" icon={Activity} colorClass="text-primary" />
        <StatCard title={t('dashboard', 'weight')} value={profile.weight} unit="kg" icon={Scale} colorClass="text-purple-400" to="/profile" />
        <StatCard title={t('dashboard', 'est1rm')} value={profile.oneRepMaxes?.find(r=>r.id==='bp')?.weight || '--'} unit="kg" icon={Zap} colorClass="text-pink-500" to="/profile" />
      </div>

      {/* Volume Chart */}
      <Link to="/history" className="block group">
        <div className="glass-panel rounded-3xl p-5 border border-white/5 transition-colors hover:border-white/10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-white font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
              <Activity size={16} className="text-primary" />
              {t('dashboard', 'volumeTrend')}
            </h2>
          </div>
          <div className="h-40 w-full">
            {logs.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeData}>
                  <defs>
                    <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#CCFF00" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#CCFF00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    tick={{fontSize: 10, fill: '#52525B', fontFamily: 'JetBrains Mono'}} 
                    axisLine={false} 
                    tickLine={false}
                    interval="preserveStartEnd"
                    dy={10}
                  />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#12161F', border: '1px solid #333', borderRadius: '8px', fontSize: '12px', fontFamily: 'JetBrains Mono'}}
                    itemStyle={{color: '#CCFF00'}}
                    cursor={{stroke: '#CCFF00', strokeWidth: 1, strokeDasharray: '4 4'}}
                  />
                  <Area type="monotone" dataKey="volume" stroke="#CCFF00" strokeWidth={2} fillOpacity={1} fill="url(#colorVol)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted text-xs font-mono">
                NO DATA AVAILABLE // START TRAINING
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Dashboard;
