import React, { useState } from 'react';
import { storage } from '../services/storageService';
import { Search, ChevronRight } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

const ExerciseLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { t, language } = useAppContext();
  const exercises = storage.getExercises();

  const getExerciseName = (ex: any) => {
    return language === 'zh' && ex.name_zh ? ex.name_zh : ex.name;
  };

  const filtered = exercises.filter(e => {
    const name = getExerciseName(e).toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || 
           e.target_muscle.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-4 pb-24 min-h-screen">
       <h1 className="text-2xl font-bold text-white mb-4">{t('library', 'title')}</h1>
       
       <div className="relative mb-6">
         <Search className="absolute left-3 top-3 text-muted" size={18} />
         <input 
           type="text"
           placeholder={t('library', 'searchPlaceholder')}
           className="w-full bg-surface border border-border text-white pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-primary transition-colors"
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
         />
       </div>

       <div className="space-y-3">
         {filtered.map(ex => (
           <div key={ex.id} className="bg-surface border border-border rounded-xl p-3 flex items-center gap-4 hover:border-zinc-600 transition-colors cursor-pointer group">
              <img src={ex.image_url} alt={ex.name} className="w-16 h-16 rounded-md object-cover bg-zinc-800" />
              <div className="flex-1">
                <h3 className="text-white font-medium group-hover:text-primary transition-colors">{getExerciseName(ex)}</h3>
                <div className="flex gap-2 mt-1">
                  <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-700">
                    {t('library', 'muscle')}: {ex.target_muscle}
                  </span>
                  <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-700">
                    {ex.type}
                  </span>
                </div>
              </div>
              <ChevronRight className="text-zinc-600" size={20} />
           </div>
         ))}
       </div>
    </div>
  );
};

export default ExerciseLibrary;