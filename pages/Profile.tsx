
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Save, CheckCircle2, ArrowLeft, Trophy, Plus, X, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StrengthRecord } from '../types';

const Profile: React.FC = () => {
  const { profile, updateProfile, t, exercises, language } = useAppContext();
  const [formData, setFormData] = useState(profile);
  const [isSaved, setIsSaved] = useState(false);
  const [isAddingStrength, setIsAddingStrength] = useState(false);
  const [searchStrength, setSearchStrength] = useState('');

  // Sync state with profile
  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'height' || name === 'weight' || name === 'body_fat_percentage' || name === 'age' 
        ? parseFloat(value) 
        : value
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

  // --- Strength Record Logic ---

  const handleStrengthChange = (exerciseId: string, value: string) => {
    const newVal = parseFloat(value) || 0;
    const currentRecords = formData.strength_records || [];
    const updatedRecords = currentRecords.map(rec => 
      rec.exercise_id === exerciseId ? { ...rec, one_rep_max: newVal } : rec
    );
    setFormData(prev => ({ ...prev, strength_records: updatedRecords }));
  };

  const removeStrengthRecord = (exerciseId: string) => {
    const currentRecords = formData.strength_records || [];
    const updatedRecords = currentRecords.filter(rec => rec.exercise_id !== exerciseId);
    setFormData(prev => ({ ...prev, strength_records: updatedRecords }));
  };

  const addStrengthRecord = (exerciseId: string) => {
    const currentRecords = formData.strength_records || [];
    if (currentRecords.length >= 6) return;
    
    // Don't add if already exists
    if (currentRecords.find(r => r.exercise_id === exerciseId)) {
        setIsAddingStrength(false);
        return;
    }

    const newRecord: StrengthRecord = { exercise_id: exerciseId, one_rep_max: 0 };
    setFormData(prev => ({ ...prev, strength_records: [...currentRecords, newRecord] }));
    setIsAddingStrength(false);
    setSearchStrength('');
  };

  const getExerciseName = (id: string) => {
    const ex = exercises.find(e => e.id === id);
    if (!ex) return id;
    return language === 'zh' && ex.name_zh ? ex.name_zh : ex.name;
  };

  const filteredExercisesForAdd = exercises.filter(ex => {
    const name = (language === 'zh' && ex.name_zh ? ex.name_zh : ex.name).toLowerCase();
    const matchesSearch = name.includes(searchStrength.toLowerCase());
    const alreadyAdded = formData.strength_records?.some(r => r.exercise_id === ex.id);
    return matchesSearch && !alreadyAdded;
  });

  return (
    <div className="p-4 pb-24 min-h-screen relative">
      <header className="flex items-center gap-3 mb-6">
        <Link to="/settings" className="p-2 -ml-2 text-zinc-400 hover:text-white">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-white">{t('profile', 'title')}</h1>
      </header>

      {/* Body Stats Section */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
          {t('profile', 'bodyStats')}
        </h2>
        <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
          
          {/* Name */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">{t('settings', 'name')}</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Gender */}
            <div>
               <label className="block text-xs text-gray-400 mb-1">{t('settings', 'gender')}</label>
               <select 
                name="gender"
                value={formData.gender || 'Male'}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none appearance-none"
               >
                 <option value="Male">{t('settings', 'male')}</option>
                 <option value="Female">{t('settings', 'female')}</option>
                 <option value="Other">{t('settings', 'other')}</option>
               </select>
            </div>

            {/* Age */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">{t('settings', 'age')}</label>
              <input 
                type="number" 
                name="age"
                value={formData.age || ''}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Height */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">{t('settings', 'height')}</label>
              <input 
                type="number" 
                name="height"
                value={formData.height}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
              />
            </div>
             {/* Weight */}
             <div>
              <label className="block text-xs text-gray-400 mb-1">{t('settings', 'weight')}</label>
              <input 
                type="number" 
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Body Fat */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">{t('settings', 'bodyFat')}</label>
              <input 
                type="number" 
                name="body_fat_percentage"
                value={formData.body_fat_percentage || ''}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
              />
            </div>
             {/* BMI Display */}
             <div>
              <label className="block text-xs text-gray-400 mb-1">{t('settings', 'bmi')}</label>
              <div className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-2 text-muted cursor-not-allowed">
                {calculateBMI()}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Strength Records Section */}
      <section className="mb-20">
        <div className="flex justify-between items-end mb-3">
            <div>
                <h2 className="text-sm font-semibold text-muted uppercase tracking-wider flex items-center gap-2">
                <Trophy size={14} className="text-secondary" />
                {t('profile', 'strengthStats')}
                </h2>
                <p className="text-[10px] text-zinc-500 mt-1">{t('profile', 'strengthDesc')}</p>
            </div>
            <span className="text-[10px] text-zinc-500">
                {(formData.strength_records || []).length}/6
            </span>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
           {(formData.strength_records || []).map((record) => (
             <div key={record.exercise_id} className="bg-surface border border-border rounded-xl p-3 flex items-center justify-between">
                <div className="flex-1 overflow-hidden mr-4">
                    <p className="text-sm font-medium text-white truncate">{getExerciseName(record.exercise_id)}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative w-20">
                        <input 
                          type="number" 
                          value={record.one_rep_max || ''}
                          onChange={(e) => handleStrengthChange(record.exercise_id, e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-2 py-1 text-right text-white text-sm focus:border-primary focus:outline-none pr-6"
                          placeholder="0"
                        />
                        <span className="absolute right-2 top-1.5 text-xs text-zinc-500">kg</span>
                    </div>
                    <button 
                      onClick={() => removeStrengthRecord(record.exercise_id)}
                      className="text-zinc-600 hover:text-red-500 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
             </div>
           ))}

           {/* Add Button */}
           {(formData.strength_records || []).length < 6 && (
             <button 
               onClick={() => setIsAddingStrength(true)}
               className="border border-dashed border-zinc-700 rounded-xl p-3 flex items-center justify-center gap-2 text-zinc-500 hover:text-primary hover:border-primary transition-all text-sm"
             >
                <Plus size={16} />
                {t('profile', 'addRecord')}
             </button>
           )}

           {(formData.strength_records || []).length >= 6 && (
             <p className="text-center text-[10px] text-zinc-600 mt-2">{t('profile', 'maxReached')}</p>
           )}
        </div>
      </section>

      {/* Floating Save Button */}
      <div className="fixed bottom-24 left-0 w-full px-4 z-10 pointer-events-none">
        <div className="max-w-2xl mx-auto pointer-events-auto">
            <button 
                onClick={handleSave}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-black/50 ${
                isSaved 
                ? 'bg-green-500 text-white' 
                : 'bg-primary text-background hover:bg-opacity-90'
                }`}
            >
                {isSaved ? (
                <>
                    <CheckCircle2 size={18} /> {t('settings', 'saved')}
                </>
                ) : (
                <>
                    <Save size={18} /> {t('settings', 'save')}
                </>
                )}
            </button>
        </div>
      </div>

      {/* Add Exercise Modal */}
      {isAddingStrength && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-surface border border-border w-full max-w-md rounded-2xl flex flex-col max-h-[80vh]">
                  <div className="p-4 border-b border-border flex justify-between items-center">
                      <h3 className="font-bold text-white">{t('profile', 'selectExercise')}</h3>
                      <button onClick={() => setIsAddingStrength(false)} className="text-zinc-400 hover:text-white">
                          <X size={20} />
                      </button>
                  </div>
                  <div className="p-3 border-b border-border">
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-zinc-500" size={16} />
                        <input 
                            type="text" 
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                            placeholder={t('library', 'searchPlaceholder')}
                            autoFocus
                            value={searchStrength}
                            onChange={(e) => setSearchStrength(e.target.value)}
                        />
                      </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2">
                      {filteredExercisesForAdd.length === 0 ? (
                          <div className="text-center py-8 text-muted text-xs">No exercises found</div>
                      ) : (
                          <div className="space-y-1">
                              {filteredExercisesForAdd.map(ex => (
                                  <button 
                                    key={ex.id}
                                    onClick={() => addStrengthRecord(ex.id)}
                                    className="w-full text-left p-3 hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-3"
                                  >
                                      <img src={ex.image_url} alt="" className="w-10 h-10 rounded object-cover bg-zinc-900" />
                                      <div>
                                          <div className="text-sm font-medium text-white">
                                            {language === 'zh' && ex.name_zh ? ex.name_zh : ex.name}
                                          </div>
                                          <div className="text-[10px] text-muted">{ex.target_muscle}</div>
                                      </div>
                                  </button>
                              ))}
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default Profile;
