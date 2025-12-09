
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Save, CheckCircle2, ArrowLeft, Ruler, Weight, User, Zap, Plus, Trash2, Edit2, Target, X, Search, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Exercise, OneRepMax, Gender } from '../types';

const AVATAR_COLORS = [
  'from-primary to-emerald-400',
  'from-secondary to-purple-400',
  'from-blue-500 to-cyan-400',
  'from-rose-500 to-orange-400',
  'from-amber-400 to-yellow-200',
  'from-zinc-500 to-zinc-300',
];

// Helper: Exercise Picker Modal for Profile
const ProfileExercisePicker = ({ isOpen, onClose, onSelect, excludeIds }: { isOpen: boolean; onClose: () => void; onSelect: (ex: Exercise) => void; excludeIds: string[] }) => {
  const { exercises, language } = useAppContext();
  const [term, setTerm] = useState('');

  if (!isOpen) return null;

  const filtered = exercises.filter(e => {
    // 1. Exclude existing
    if (excludeIds.includes(e.id)) return false;
    
    // 2. Search filter
    const name = language === 'zh' && e.name_zh ? e.name_zh : e.name;
    return name.toLowerCase().includes(term.toLowerCase());
  });

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
       <div className="w-full max-w-sm bg-surface border border-white/10 rounded-2xl flex flex-col max-h-[70vh] shadow-2xl">
          <div className="p-4 border-b border-white/10 flex items-center gap-3">
            <Search size={18} className="text-muted" />
            <input 
                autoFocus
                type="text"
                placeholder="Search..."
                className="flex-1 bg-transparent border-none focus:outline-none text-white text-sm"
                value={term}
                onChange={e => setTerm(e.target.value)}
            />
            <button onClick={onClose}><X size={20} className="text-muted" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
             {filtered.map(ex => (
                <button 
                  key={ex.id}
                  onClick={() => onSelect(ex)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors text-left"
                >
                   <div className="w-10 h-10 rounded bg-black/40 border border-white/5 overflow-hidden shrink-0">
                      <img src={ex.image_url} className="w-full h-full object-cover opacity-80" alt="" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white truncate">{language === 'zh' && ex.name_zh ? ex.name_zh : ex.name}</div>
                      <div className="text-[10px] text-muted uppercase">{ex.target_muscle}</div>
                   </div>
                   <ChevronRight size={16} className="text-muted" />
                </button>
             ))}
             {filtered.length === 0 && (
                <div className="p-4 text-center text-xs text-muted">No exercises found</div>
             )}
          </div>
       </div>
    </div>
  );
};

const Profile: React.FC = () => {
  const { profile, updateProfile, t, language, exercises } = useAppContext();
  const [formData, setFormData] = useState(profile);
  const [isSaved, setIsSaved] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  
  // Ensure data initialized
  useEffect(() => {
    const updated = { ...profile };
    let changed = false;

    if (!updated.oneRepMaxes) {
       // Should match storageService defaults now
       updated.oneRepMaxes = [
           { id: 'legs_sq_highbar', name: 'Barbell Back Squat', weight: 0, goal_weight: 0 },
           { id: 'chest_bb_bench_flat', name: 'Flat Barbell Bench Press', weight: 0, goal_weight: 0 },
           { id: 'back_deadlift_conventional', name: 'Conventional Deadlift', weight: 0, goal_weight: 0 }
       ];
       changed = true;
    }
    if (!updated.goals) {
      updated.goals = { target_weight: 0, target_body_fat: 0 };
      changed = true;
    }
    
    if (changed) updateProfile(updated);
    setFormData(updated);
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'height' || name === 'weight' || name === 'body_fat_percentage' || name === 'age') 
        ? parseFloat(value) 
        : value
    }));
  };

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      goals: {
        ...prev.goals,
        [name]: parseFloat(value)
      }
    }));
  };

  const handle1RMChange = (id: string, field: 'weight' | 'goal_weight', value: number) => {
    const updated = formData.oneRepMaxes?.map(r => r.id === id ? { ...r, [field]: value } : r) || [];
    setFormData(prev => ({ ...prev, oneRepMaxes: updated }));
  };

  const handleAddRecord = (ex: Exercise) => {
    if ((formData.oneRepMaxes?.length || 0) >= 8) return;
    const name = language === 'zh' && ex.name_zh ? ex.name_zh : ex.name;
    const newRecord: OneRepMax = {
      id: ex.id,
      name: name,
      weight: 0,
      goal_weight: 0
    };
    setFormData(prev => ({ 
      ...prev, 
      oneRepMaxes: [...(prev.oneRepMaxes || []), newRecord] 
    }));
    setShowPicker(false);
  };

  const handleDeleteRecord = (id: string) => {
    setFormData(prev => ({
      ...prev,
      oneRepMaxes: prev.oneRepMaxes?.filter(r => r.id !== id)
    }));
  };

  const handleSave = () => {
    updateProfile(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const calculateBMI = () => {
    if (formData.weight && formData.height) {
      const heightM = formData.height / 100;
      return (formData.weight / (heightM * heightM)).toFixed(1);
    }
    return '--';
  };

  const get1RMName = (rec: OneRepMax) => {
    // Try to find in library for latest translation
    const match = exercises.find(e => e.id === rec.id);
    if (match) {
        return language === 'zh' && match.name_zh ? match.name_zh : match.name;
    }
    // Fallback to legacy checks or stored name
    if (rec.id === 'sq' || rec.id === 'legs_sq_highbar') return t('profile', 'squat');
    if (rec.id === 'bp' || rec.id === 'chest_bb_bench_flat') return t('profile', 'bench');
    if (rec.id === 'dl' || rec.id === 'back_deadlift_conventional') return t('profile', 'deadlift');
    
    return rec.name;
  };

  return (
    <div className="p-4 pb-24 min-h-screen relative">
      <ProfileExercisePicker 
        isOpen={showPicker} 
        onClose={() => setShowPicker(false)} 
        onSelect={handleAddRecord}
        excludeIds={formData.oneRepMaxes?.map(r => r.id) || []}
      />

      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="p-2 bg-surface border border-border rounded-full text-muted hover:text-white transition-colors">
            <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-white">{t('profile', 'title')}</h1>
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col items-center mb-8">
         <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${formData.avatar || AVATAR_COLORS[0]} shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center justify-center text-4xl font-bold text-black border-4 border-surface relative group`}>
            {formData.name[0]}
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold cursor-pointer">
              <Edit2 size={24} />
            </div>
         </div>
         <div className="mt-4 flex gap-2">
            {AVATAR_COLORS.map(color => (
              <button 
                key={color} 
                onClick={() => setFormData(prev => ({ ...prev, avatar: color }))}
                className={`w-6 h-6 rounded-full bg-gradient-to-br ${color} border-2 ${formData.avatar === color ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'} transition-all`}
              />
            ))}
         </div>
         <div className="mt-4 text-center">
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="bg-transparent text-center text-xl font-bold text-white focus:outline-none border-b border-transparent focus:border-primary w-full max-w-[200px]"
            />
         </div>
      </div>

      {/* Body Stats Section */}
      <section className="mb-6">
         <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
            <User size={16} />
            {t('profile', 'stats')}
         </h2>
         <div className="bg-surface border border-border rounded-xl p-5 grid grid-cols-2 gap-4">
             {/* Gender */}
             <div className="col-span-1">
                <label className="text-xs text-gray-400 mb-1 block">{t('settings', 'gender')}</label>
                <select name="gender" value={formData.gender || 'Male'} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary focus:outline-none">
                   <option value="Male">{t('settings', 'male')}</option>
                   <option value="Female">{t('settings', 'female')}</option>
                   <option value="Other">{t('settings', 'other')}</option>
                </select>
             </div>
             
             {/* Age */}
             <div>
               <label className="text-xs text-gray-400 mb-1 block">{t('settings', 'age')}</label>
               <input type="number" name="age" value={formData.age || ''} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-right font-mono focus:border-primary focus:outline-none" />
             </div>

             {/* Height */}
             <div>
               <label className="text-xs text-gray-400 mb-1 block flex items-center gap-1"><Ruler size={10} /> {t('settings', 'height')}</label>
               <input type="number" name="height" value={formData.height} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-right font-mono focus:border-primary focus:outline-none" />
             </div>
             
             {/* Weight */}
             <div>
               <label className="text-xs text-gray-400 mb-1 block flex items-center gap-1"><Weight size={10} /> {t('settings', 'weight')}</label>
               <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-right font-mono focus:border-primary focus:outline-none" />
             </div>

             {/* Body Fat */}
             <div>
               <label className="text-xs text-gray-400 mb-1 block">{t('settings', 'bodyFat')}</label>
               <input type="number" name="body_fat_percentage" value={formData.body_fat_percentage || ''} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-right font-mono focus:border-primary focus:outline-none" />
             </div>

             {/* BMI */}
             <div className="flex flex-col justify-end">
                <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/5 flex justify-between items-center">
                   <span className="text-xs text-muted">BMI</span>
                   <span className="text-sm font-bold text-primary font-mono">{calculateBMI()}</span>
                </div>
             </div>
         </div>
      </section>

      {/* Goals Section */}
      <section className="mb-6">
         <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
            <Target size={16} className="text-accent" />
            {t('profile', 'goals')}
         </h2>
         <div className="bg-surface border border-border rounded-xl p-5 grid grid-cols-2 gap-4">
             <div>
               <label className="text-xs text-gray-400 mb-1 block">{t('settings', 'targetWeight')}</label>
               <input type="number" name="target_weight" value={formData.goals?.target_weight || ''} onChange={handleGoalChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-right font-mono focus:border-accent focus:outline-none" placeholder="--" />
             </div>
             <div>
               <label className="text-xs text-gray-400 mb-1 block">{t('settings', 'targetFat')}</label>
               <input type="number" name="target_body_fat" value={formData.goals?.target_body_fat || ''} onChange={handleGoalChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-right font-mono focus:border-accent focus:outline-none" placeholder="--" />
             </div>
         </div>
      </section>

      {/* 1RM Section */}
      <section className="mb-8">
         <div className="flex justify-between items-end mb-3">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider flex items-center gap-2">
               <Zap size={16} className="text-primary" />
               {t('profile', 'oneRepMax')}
            </h2>
            <span className="text-[10px] text-zinc-500">{formData.oneRepMaxes?.length || 0}/8</span>
         </div>
         
         <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
             <div className="grid grid-cols-12 gap-2 px-2 text-[10px] text-muted font-bold uppercase">
                <div className="col-span-5">Lift</div>
                <div className="col-span-3 text-right text-white">Current</div>
                <div className="col-span-3 text-right text-accent">Target</div>
                <div className="col-span-1"></div>
             </div>
             
             {formData.oneRepMaxes?.map((rec) => (
                <div key={rec.id} className="grid grid-cols-12 gap-2 items-center">
                   <div className="col-span-5">
                      <div className="text-xs text-gray-300 font-bold truncate">{get1RMName(rec)}</div>
                   </div>
                   <div className="col-span-3 relative">
                      <input 
                        type="number" 
                        value={rec.weight || ''} 
                        onChange={(e) => handle1RMChange(rec.id, 'weight', parseFloat(e.target.value))}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-right text-white font-mono focus:border-primary focus:outline-none text-xs"
                        placeholder="0"
                      />
                   </div>
                   <div className="col-span-3 relative">
                      <input 
                        type="number" 
                        value={rec.goal_weight || ''} 
                        onChange={(e) => handle1RMChange(rec.id, 'goal_weight', parseFloat(e.target.value))}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-right text-accent font-mono focus:border-accent focus:outline-none text-xs"
                        placeholder="--"
                      />
                   </div>
                   <div className="col-span-1 flex justify-center">
                      <button onClick={() => handleDeleteRecord(rec.id)} className="p-1.5 text-zinc-600 hover:text-red-500 transition-colors">
                        <Trash2 size={12} />
                      </button>
                   </div>
                </div>
             ))}

             {/* Add New */}
             {(formData.oneRepMaxes?.length || 0) < 8 ? (
                <button 
                  onClick={() => setShowPicker(true)}
                  className="w-full py-3 mt-2 flex items-center justify-center gap-2 bg-black/20 border border-dashed border-white/10 rounded-lg hover:border-primary/50 hover:text-primary text-xs font-bold text-muted transition-all"
                >
                  <Plus size={14} /> {t('profile', 'addRecord')}
                </button>
             ) : (
                <div className="text-center text-[10px] text-muted pt-2">{t('profile', 'maxItems')}</div>
             )}
         </div>
      </section>

      {/* Floating Save Button */}
      <div className="fixed bottom-24 left-0 right-0 px-4 flex justify-center pointer-events-none">
         <button 
            onClick={handleSave}
            className={`pointer-events-auto shadow-2xl shadow-black max-w-sm w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all transform ${
              isSaved 
              ? 'bg-green-500 text-white translate-y-0' 
              : 'bg-primary text-black translate-y-0 hover:scale-[1.02]'
            }`}
          >
            {isSaved ? (
              <>
                <CheckCircle2 size={20} /> {t('settings', 'saved')}
              </>
            ) : (
              <>
                <Save size={20} /> {t('settings', 'save')}
              </>
            )}
          </button>
      </div>
    </div>
  );
};

export default Profile;
