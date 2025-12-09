import React, { useState, useMemo } from 'react';
import { storage } from '../services/storageService';
import { Search, ChevronRight, PlayCircle, Image as ImageIcon, X, Info, Layers, ChevronDown, Dumbbell, Home, Zap } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { Exercise, MuscleGroup, ExerciseType } from '../types';
import { translations } from '../utils/i18n';

const ExerciseLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'All'>('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showGif, setShowGif] = useState(false);
  
  // Accordion state for sidebar
  const [expandedMuscle, setExpandedMuscle] = useState<string | null>('Chest');

  const { t, language } = useAppContext();
  const exercises = storage.getExercises();

  // --- Helper Functions ---
  const getExerciseName = (ex: any) => {
    return language === 'zh' && ex.name_zh ? ex.name_zh : ex.name;
  };

  const getInstructions = (ex: any) => {
    return language === 'zh' && ex.instructions_zh ? ex.instructions_zh : ex.instructions;
  };

  const getCategoryName = (cat: string | undefined) => {
    if (!cat) return language === 'zh' ? '其他' : 'Other';
    // @ts-ignore
    const translated = translations[language].categories?.[cat];
    return translated || cat;
  };

  const getMuscleName = (muscle: string) => {
    if (muscle === 'All') return language === 'zh' ? '全部' : 'All';
    // @ts-ignore
    return translations[language].categories?.[muscle] || muscle;
  };

  // --- Grouping Logic for Sidebar ---
  const muscleSubCategories = useMemo(() => {
    const mapping: Record<string, Set<string>> = {};
    exercises.forEach(ex => {
       if (!mapping[ex.target_muscle]) mapping[ex.target_muscle] = new Set();
       if (ex.sub_category) mapping[ex.target_muscle].add(ex.sub_category);
    });
    return mapping;
  }, [exercises]);

  const muscleGroups = Object.keys(muscleSubCategories) as MuscleGroup[];

  // --- Filter Logic for Right Panel ---
  const filteredExercises = useMemo(() => {
    return exercises.filter(e => {
      const name = getExerciseName(e).toLowerCase();
      const matchesSearch = name.includes(searchTerm.toLowerCase());
      
      let matchesCategory = true;
      if (selectedMuscle !== 'All') {
         if (e.target_muscle !== selectedMuscle) matchesCategory = false;
         if (selectedSubCategory && e.sub_category !== selectedSubCategory) matchesCategory = false;
      }

      return matchesSearch && matchesCategory;
    });
  }, [exercises, searchTerm, selectedMuscle, selectedSubCategory, language]);

  // --- Grouping Logic for Right Panel (Equipment) ---
  const groupedByEquipment = useMemo(() => {
    const groups = {
      gym: [] as Exercise[],
      home: [] as Exercise[],
      bodyweight: [] as Exercise[]
    };

    filteredExercises.forEach(ex => {
      if (ex.type === ExerciseType.BODYWEIGHT) {
        groups.bodyweight.push(ex);
      } else if (ex.type === ExerciseType.DUMBBELL || ex.type === ExerciseType.KETTLEBELL || ex.type === ExerciseType.BAND) {
        groups.home.push(ex);
      } else {
        // Barbell, Machine, Cable usually Gym
        groups.gym.push(ex);
      }
    });

    return groups;
  }, [filteredExercises]);

  const handleMuscleClick = (muscle: string) => {
    if (expandedMuscle === muscle) {
      setExpandedMuscle(null);
    } else {
      setExpandedMuscle(muscle);
      setSelectedMuscle(muscle as MuscleGroup);
      setSelectedSubCategory(null); // Reset sub when changing main
    }
  };

  const handleSubClick = (e: React.MouseEvent, sub: string) => {
    e.stopPropagation();
    setSelectedSubCategory(sub);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-background">
       {/* Top Search Bar */}
       <div className="p-4 border-b border-white/5 bg-background z-10">
         <div className="relative">
           <Search className="absolute left-3 top-3 text-muted" size={18} />
           <input 
             type="text"
             placeholder={t('library', 'searchPlaceholder')}
             className="w-full bg-surface border border-border text-white pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-primary transition-colors text-sm"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
         </div>
       </div>

       {/* Split View Container */}
       <div className="flex flex-1 overflow-hidden">
         
         {/* LEFT SIDEBAR (Accordion) */}
         <div className="w-1/3 md:w-1/4 bg-surface border-r border-white/5 overflow-y-auto no-scrollbar pb-24">
            <div className="p-2 space-y-1">
              {muscleGroups.map(muscle => (
                <div key={muscle} className="rounded-lg overflow-hidden">
                   {/* Main Muscle Header */}
                   <button 
                     onClick={() => handleMuscleClick(muscle)}
                     className={`w-full flex items-center justify-between p-3 text-xs font-bold uppercase tracking-wider transition-all ${
                       selectedMuscle === muscle ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'
                     }`}
                   >
                     {/* @ts-ignore */}
                     {t('categories', muscle) || muscle}
                     {expandedMuscle === muscle ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                   </button>
                   
                   {/* Sub Categories */}
                   {expandedMuscle === muscle && (
                     <div className="bg-black/20 animate-in slide-in-from-top-2 duration-200">
                       {Array.from(muscleSubCategories[muscle]).map(sub => (
                         <button
                           key={sub}
                           onClick={(e) => handleSubClick(e, sub)}
                           className={`w-full text-left pl-6 pr-2 py-2.5 text-xs font-medium border-l-2 transition-all ${
                             selectedSubCategory === sub 
                             ? 'border-primary text-primary bg-primary/5' 
                             : 'border-transparent text-zinc-400 hover:text-white'
                           }`}
                         >
                           {getCategoryName(sub)}
                         </button>
                       ))}
                     </div>
                   )}
                </div>
              ))}
            </div>
         </div>

         {/* RIGHT PANEL (Content) */}
         <div className="flex-1 overflow-y-auto pb-24 p-4 space-y-8 bg-background relative">
           {filteredExercises.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-muted opacity-50">
               <Layers size={48} className="mb-4" />
               <p className="text-sm">{t('library', 'selectCategory')}</p>
             </div>
           ) : (
             <>
                {/* Gym Section */}
                {groupedByEquipment.gym.length > 0 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-white mb-3 uppercase tracking-wider border-b border-white/10 pb-2">
                       <Dumbbell size={16} className="text-primary" />
                       {t('library', 'gym')}
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {groupedByEquipment.gym.map(ex => (
                        <ExerciseCard key={ex.id} ex={ex} onClick={() => setSelectedExercise(ex)} getName={getExerciseName} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Home Section */}
                {groupedByEquipment.home.length > 0 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300 delay-75">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-white mb-3 uppercase tracking-wider border-b border-white/10 pb-2">
                       <Home size={16} className="text-secondary" />
                       {t('library', 'home')}
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {groupedByEquipment.home.map(ex => (
                        <ExerciseCard key={ex.id} ex={ex} onClick={() => setSelectedExercise(ex)} getName={getExerciseName} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Bodyweight Section */}
                {groupedByEquipment.bodyweight.length > 0 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300 delay-100">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-white mb-3 uppercase tracking-wider border-b border-white/10 pb-2">
                       <Zap size={16} className="text-accent" />
                       {t('library', 'bodyweight')}
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {groupedByEquipment.bodyweight.map(ex => (
                        <ExerciseCard key={ex.id} ex={ex} onClick={() => setSelectedExercise(ex)} getName={getExerciseName} />
                      ))}
                    </div>
                  </div>
                )}
             </>
           )}
         </div>
       </div>

       {/* Detail Modal */}
       {selectedExercise && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface border border-border w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
              
              <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-10 bg-gradient-to-b from-black/80 to-transparent">
                 <span className="bg-black/50 backdrop-blur text-white text-xs px-3 py-1 rounded-full border border-white/10">
                   {selectedExercise.type}
                 </span>
                 <button 
                  onClick={() => { setSelectedExercise(null); setShowGif(false); }} 
                  className="bg-black/50 backdrop-blur p-2 rounded-full text-white hover:bg-white/20"
                 >
                   <X size={20} />
                 </button>
              </div>

              <div className="relative aspect-video bg-zinc-900 w-full shrink-0">
                {showGif && selectedExercise.gif_url ? (
                  <img src={selectedExercise.gif_url} className="w-full h-full object-cover" alt="Animation" />
                ) : (
                  <img src={selectedExercise.image_url} className="w-full h-full object-cover" alt="Static" />
                )}

                {selectedExercise.gif_url && (
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
                )}
              </div>

              <div className="p-6 overflow-y-auto">
                 <h2 className="text-2xl font-bold text-white mb-1">{getExerciseName(selectedExercise)}</h2>
                 <p className="text-primary text-sm font-medium mb-4 flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-primary"></span>
                   {getCategoryName(selectedExercise.sub_category)}
                 </p>

                 <div className="space-y-4">
                   <div>
                     <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Instructions</h3>
                     <p className="text-gray-300 text-sm leading-relaxed">
                       {getInstructions(selectedExercise)}
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

const ExerciseCard = ({ ex, onClick, getName }: { ex: Exercise, onClick: () => void, getName: (e: any) => string }) => (
  <div 
    onClick={onClick}
    className="bg-surface border border-white/5 rounded-xl p-3 flex items-center gap-3 hover:border-white/20 hover:bg-white/5 transition-all cursor-pointer group active:scale-[0.98]"
  >
    <div className="w-12 h-12 rounded-lg bg-zinc-800 overflow-hidden shrink-0 border border-white/5">
      <img src={ex.image_url} alt={ex.name} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-white text-sm font-medium truncate group-hover:text-primary transition-colors">{getName(ex)}</h4>
      <p className="text-[10px] text-zinc-500">{ex.type}</p>
    </div>
    <ChevronRight size={16} className="text-zinc-700 group-hover:text-white" />
  </div>
);

export default ExerciseLibrary;