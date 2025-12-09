import React, { useState } from 'react';
import { storage } from '../services/storageService';
import { Search, ChevronRight, PlayCircle, Image as ImageIcon, X, Info } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { Exercise, MuscleGroup } from '../types';

const ExerciseLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('All');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showGif, setShowGif] = useState(false);

  const { t, language } = useAppContext();
  const exercises = storage.getExercises();

  // Translations for muscle groups
  const muscleGroups = ['All', ...Object.values(MuscleGroup)];
  
  const getExerciseName = (ex: any) => {
    return language === 'zh' && ex.name_zh ? ex.name_zh : ex.name;
  };

  const getInstructions = (ex: any) => {
    return language === 'zh' && ex.instructions_zh ? ex.instructions_zh : ex.instructions;
  };

  const filtered = exercises.filter(e => {
    const name = getExerciseName(e).toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase());
    const matchesMuscle = selectedMuscle === 'All' || e.target_muscle === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  return (
    <div className="p-4 pb-24 min-h-screen">
       <h1 className="text-2xl font-bold text-white mb-4">{t('library', 'title')}</h1>
       
       {/* Search Bar */}
       <div className="relative mb-4">
         <Search className="absolute left-3 top-3 text-muted" size={18} />
         <input 
           type="text"
           placeholder={t('library', 'searchPlaceholder')}
           className="w-full bg-surface border border-border text-white pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-primary transition-colors"
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
         />
       </div>

       {/* Muscle Filter Chips */}
       <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
         {muscleGroups.map(muscle => (
           <button
             key={muscle}
             onClick={() => setSelectedMuscle(muscle)}
             className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
               selectedMuscle === muscle 
               ? 'bg-primary text-background font-bold' 
               : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
             }`}
           >
             {muscle === 'All' ? (language === 'zh' ? '全部' : 'All') : muscle}
           </button>
         ))}
       </div>

       {/* Exercise List */}
       <div className="space-y-3">
         {filtered.length === 0 ? (
           <div className="text-center text-muted py-10 text-sm">No exercises found.</div>
         ) : (
           filtered.map(ex => (
             <div 
               key={ex.id} 
               onClick={() => { setSelectedExercise(ex); setShowGif(false); }}
               className="bg-surface border border-border rounded-xl p-3 flex items-center gap-4 hover:border-zinc-600 transition-colors cursor-pointer group active:scale-[0.98]"
             >
                <img src={ex.image_url} alt={ex.name} className="w-16 h-16 rounded-md object-cover bg-zinc-800" />
                <div className="flex-1">
                  <h3 className="text-white font-medium group-hover:text-primary transition-colors">{getExerciseName(ex)}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-700">
                      {ex.target_muscle}
                    </span>
                  </div>
                </div>
                <ChevronRight className="text-zinc-600" size={20} />
             </div>
           ))
         )}
       </div>

       {/* Detail Modal */}
       {selectedExercise && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface border border-border w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
              
              {/* Modal Header */}
              <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-10 bg-gradient-to-b from-black/80 to-transparent">
                 <span className="bg-black/50 backdrop-blur text-white text-xs px-3 py-1 rounded-full border border-white/10">
                   {selectedExercise.type}
                 </span>
                 <button 
                  onClick={() => setSelectedExercise(null)} 
                  className="bg-black/50 backdrop-blur p-2 rounded-full text-white hover:bg-white/20"
                 >
                   <X size={20} />
                 </button>
              </div>

              {/* Media Section (Image/GIF) */}
              <div className="relative aspect-video bg-zinc-900 w-full">
                {showGif && selectedExercise.gif_url ? (
                  <img src={selectedExercise.gif_url} className="w-full h-full object-cover" alt="Animation" />
                ) : (
                  <img src={selectedExercise.image_url} className="w-full h-full object-cover" alt="Static" />
                )}

                {/* Media Toggle Switch */}
                {selectedExercise.gif_url ? (
                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur rounded-full p-1 flex gap-1 border border-white/10">
                    <button 
                      onClick={() => setShowGif(false)}
                      className={`p-1.5 rounded-full transition-colors ${!showGif ? 'bg-primary text-background' : 'text-zinc-400 hover:text-white'}`}
                    >
                      <ImageIcon size={16} />
                    </button>
                    <button 
                      onClick={() => setShowGif(true)}
                      className={`p-1.5 rounded-full transition-colors ${showGif ? 'bg-primary text-background' : 'text-zinc-400 hover:text-white'}`}
                    >
                      <PlayCircle size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur rounded-full px-3 py-1.5 border border-white/10 text-[10px] text-muted flex items-center gap-1">
                    <Info size={12} /> No GIF Available
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="p-6 overflow-y-auto">
                 <h2 className="text-2xl font-bold text-white mb-1">{getExerciseName(selectedExercise)}</h2>
                 <p className="text-primary text-sm font-medium mb-4 flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-primary"></span>
                   {selectedExercise.target_muscle}
                 </p>

                 <div className="space-y-4">
                   <div>
                     <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Instructions</h3>
                     <p className="text-gray-300 text-sm leading-relaxed">
                       {getInstructions(selectedExercise)}
                     </p>
                   </div>

                   {/* Pro Tip Placeholder */}
                   <div className="bg-blue-900/10 border border-blue-900/30 rounded-xl p-4 flex gap-3">
                      <Info className="text-blue-400 shrink-0" size={18} />
                      <p className="text-xs text-blue-300">
                        Focus on mind-muscle connection. Control the eccentric (lowering) phase for better hypertrophy.
                      </p>
                   </div>
                 </div>
              </div>

            </div>
         </div>
       )}
    </div>
  );
};

export default ExerciseLibrary;