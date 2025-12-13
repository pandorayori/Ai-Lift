
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { generateWorkoutPlan } from '../services/geminiService';
import { PlanGenerationParams, GeneratedPlan, Language } from '../types';
import { ArrowLeft, BrainCircuit, Check, Activity, Clock, Calendar, AlertCircle, Dumbbell } from 'lucide-react';
import { Link } from 'react-router-dom';

const STEPS = 3;

const SmartPlan: React.FC = () => {
  const { profile, t } = useAppContext();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);

  const [formData, setFormData] = useState<PlanGenerationParams>({
    gender: profile.gender || 'Male',
    age: profile.age || 25,
    height: profile.height || 175,
    weight: profile.weight || 70,
    experience: 'Intermediate',
    goals: ['Muscle Gain'],
    split: 'Push / Pull / Legs',
    frequency: 4,
    duration: 60,
    injuries: []
  });

  const handleMultiSelect = (field: 'goals' | 'injuries', value: string) => {
    setFormData(prev => {
      const current = prev[field];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    const plan = await generateWorkoutPlan(formData, profile.language as Language);
    setGeneratedPlan(plan);
    setIsLoading(false);
  };

  // --- Components ---

  const SelectionBtn = ({ selected, onClick, label }: any) => (
    <button
      onClick={onClick}
      className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
        selected 
        ? 'bg-primary text-background border-primary' 
        : 'bg-zinc-900 border-zinc-800 text-gray-400 hover:border-zinc-700'
      }`}
    >
      {label}
    </button>
  );

  const renderStep1 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-lg font-bold text-white mb-4">{t('smartPlan', 'step1')}</h2>
      
      {/* Experience */}
      <div>
        <label className="block text-xs text-muted mb-2 uppercase tracking-wider">{t('smartPlan', 'experience')}</label>
        <div className="grid grid-cols-3 gap-2">
          {['Beginner', 'Intermediate', 'Advanced'].map(exp => (
            <SelectionBtn 
              key={exp}
              label={t('smartPlan', exp.toLowerCase() as any)}
              selected={formData.experience === exp}
              onClick={() => setFormData({...formData, experience: exp as any})}
            />
          ))}
        </div>
      </div>

      {/* Goals */}
      <div>
        <label className="block text-xs text-muted mb-2 uppercase tracking-wider">{t('smartPlan', 'goals')}</label>
        <div className="grid grid-cols-2 gap-2">
           {[
             { id: 'Muscle Gain', label: t('smartPlan', 'muscle') },
             { id: 'Fat Loss', label: t('smartPlan', 'fatLoss') },
             { id: 'Strength', label: t('smartPlan', 'strength') },
             { id: 'Power', label: t('smartPlan', 'power') }
           ].map(g => (
             <SelectionBtn 
               key={g.id}
               label={g.label}
               selected={formData.goals.includes(g.id)}
               onClick={() => handleMultiSelect('goals', g.id)}
             />
           ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-lg font-bold text-white mb-4">{t('smartPlan', 'step2')}</h2>

      {/* Split */}
      <div>
        <label className="block text-xs text-muted mb-2 uppercase tracking-wider">{t('smartPlan', 'split')}</label>
        <div className="grid grid-cols-2 gap-2">
           {[
             { id: 'Full Body', label: t('smartPlan', 'fullBody') },
             { id: 'Upper / Lower', label: t('smartPlan', 'upperLower') },
             { id: 'Push / Pull / Legs', label: t('smartPlan', 'ppl') },
             { id: 'Custom', label: t('smartPlan', 'custom') }
           ].map(s => (
             <SelectionBtn 
               key={s.id}
               label={s.label}
               selected={formData.split === s.id}
               onClick={() => setFormData({...formData, split: s.id})}
             />
           ))}
        </div>
      </div>

      {/* Frequency & Duration */}
      <div className="grid grid-cols-2 gap-4">
        <div>
           <label className="block text-xs text-muted mb-2 uppercase tracking-wider">{t('smartPlan', 'frequency')}</label>
           <select 
             className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
             value={formData.frequency}
             onChange={(e) => setFormData({...formData, frequency: parseInt(e.target.value)})}
           >
             {[2,3,4,5,6].map(n => <option key={n} value={n}>{n} days</option>)}
           </select>
        </div>
        <div>
           <label className="block text-xs text-muted mb-2 uppercase tracking-wider">{t('smartPlan', 'duration')}</label>
           <select 
             className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
             value={formData.duration}
             onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
           >
             {[30,45,60,90].map(n => <option key={n} value={n}>{n} min</option>)}
           </select>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-lg font-bold text-white mb-4">{t('smartPlan', 'step3')}</h2>

      <div>
        <label className="block text-xs text-muted mb-2 uppercase tracking-wider">{t('smartPlan', 'injuries')}</label>
        <div className="flex flex-wrap gap-2">
           {[
             { id: 'Shoulder', label: t('smartPlan', 'shoulder') },
             { id: 'Knee', label: t('smartPlan', 'knee') },
             { id: 'Back', label: t('smartPlan', 'back') },
             { id: 'Elbow', label: t('smartPlan', 'elbow') }
           ].map(i => (
             <button 
                key={i.id}
                onClick={() => handleMultiSelect('injuries', i.id)}
                className={`px-4 py-2 rounded-full border text-sm transition-all ${
                    formData.injuries.includes(i.id)
                    ? 'bg-red-500/20 text-red-400 border-red-500/50'
                    : 'bg-zinc-900 border-zinc-800 text-gray-400'
                }`}
             >
                {i.label}
             </button>
           ))}
           <button 
             onClick={() => setFormData({...formData, injuries: []})}
             className={`px-4 py-2 rounded-full border text-sm transition-all ${
                formData.injuries.length === 0
                ? 'bg-green-500/20 text-green-400 border-green-500/50'
                : 'bg-zinc-900 border-zinc-800 text-gray-400'
             }`}
           >
             {t('smartPlan', 'noInjuries')}
           </button>
        </div>
      </div>
    </div>
  );

  const renderResult = () => {
    if (!generatedPlan) return null;

    return (
      <div className="animate-in fade-in zoom-in-95 duration-500 pb-20">
        {/* Meta Header */}
        <div className="bg-surface border border-border rounded-xl p-4 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <BrainCircuit size={64} className="text-primary" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
               <span className="bg-primary text-background px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                 {generatedPlan.plan_meta.level}
               </span>
               <span className="bg-zinc-800 text-gray-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                 {generatedPlan.plan_meta.split}
               </span>
            </div>
            <h2 className="text-xl font-bold text-white mb-1">{generatedPlan.plan_meta.goal} Focus</h2>
            <div className="flex items-center gap-4 text-xs text-muted mt-2">
               <span className="flex items-center gap-1"><Calendar size={12}/> {generatedPlan.plan_meta.weekly_frequency}x / week</span>
               <span className="flex items-center gap-1"><Clock size={12}/> {generatedPlan.plan_meta.session_duration}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {generatedPlan.notes && generatedPlan.notes.length > 0 && (
          <div className="bg-blue-900/10 border border-blue-900/30 rounded-xl p-4 mb-6">
             <h3 className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
               <Check size={12} /> {t('smartPlan', 'notes')}
             </h3>
             <ul className="list-disc list-inside text-sm text-blue-200/80 space-y-1">
               {generatedPlan.notes.map((note, idx) => (
                 <li key={idx}>{note}</li>
               ))}
             </ul>
          </div>
        )}

        {/* Weekly Plan */}
        <div className="space-y-4">
           {generatedPlan.weekly_plan.map((day, idx) => (
             <div key={idx} className="bg-surface border border-border rounded-xl overflow-hidden">
               <div className="bg-zinc-900/50 p-3 border-b border-border flex justify-between items-center">
                 <h3 className="font-bold text-white">{day.day}</h3>
                 <span className="text-xs text-primary font-medium">{day.focus}</span>
               </div>
               <div className="divide-y divide-zinc-800">
                 {day.exercises.map((ex, i) => (
                   <div key={i} className="p-3 flex justify-between items-center hover:bg-zinc-800/30 transition-colors">
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-zinc-500">
                         <Dumbbell size={16} />
                       </div>
                       <div>
                         <p className="text-sm font-medium text-white">{ex.name}</p>
                         <p className="text-[10px] text-muted">{ex.rest}</p>
                       </div>
                     </div>
                     <div className="text-right">
                       <p className="text-sm font-mono text-white">{ex.sets} x {ex.reps}</p>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           ))}
        </div>

        <button 
          onClick={() => { setGeneratedPlan(null); setStep(1); }}
          className="w-full mt-6 py-3 border border-zinc-700 text-zinc-400 hover:text-white rounded-xl font-medium transition-colors"
        >
          {t('smartPlan', 'retry')}
        </button>
      </div>
    );
  };

  return (
    <div className="p-4 min-h-screen">
      {/* Header */}
      {!generatedPlan && (
        <header className="flex items-center gap-3 mb-6">
            <Link to="/" className="p-2 -ml-2 text-zinc-400 hover:text-white">
            <ArrowLeft size={24} />
            </Link>
            <div>
                <h1 className="text-xl font-bold text-white">{t('smartPlan', 'title')}</h1>
                <p className="text-xs text-muted">{t('smartPlan', 'subtitle')}</p>
            </div>
        </header>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
            <BrainCircuit size={64} className="text-primary animate-pulse relative z-10" />
          </div>
          <p className="mt-6 text-white font-medium animate-pulse">{t('smartPlan', 'generating')}</p>
        </div>
      ) : generatedPlan ? (
        renderResult()
      ) : (
        <div className="flex flex-col h-[calc(100vh-120px)]">
           <div className="flex-1">
             {step === 1 && renderStep1()}
             {step === 2 && renderStep2()}
             {step === 3 && renderStep3()}
           </div>

           {/* Navigation Footer */}
           <div className="mt-auto pt-6 border-t border-border flex justify-between items-center">
              <div className="flex gap-1">
                {[1,2,3].map(i => (
                  <div key={i} className={`h-1.5 w-6 rounded-full ${step >= i ? 'bg-primary' : 'bg-zinc-800'}`} />
                ))}
              </div>
              
              <div className="flex gap-3">
                {step > 1 && (
                  <button 
                    onClick={() => setStep(step - 1)}
                    className="px-4 py-2 text-sm text-zinc-400 hover:text-white font-medium"
                  >
                    {t('smartPlan', 'backBtn')}
                  </button>
                )}
                {step < STEPS ? (
                   <button 
                     onClick={() => setStep(step + 1)}
                     className="px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
                   >
                     Next
                   </button>
                ) : (
                   <button 
                     onClick={handleGenerate}
                     className="px-6 py-2 bg-primary text-background font-bold rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
                   >
                     <BrainCircuit size={16} />
                     {t('smartPlan', 'generate')}
                   </button>
                )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SmartPlan;
