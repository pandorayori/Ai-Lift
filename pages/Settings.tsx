
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../services/storageService';
import { Save, User, Globe, CheckCircle2, Cloud, RefreshCw, Database, LogOut, AlertTriangle, Trash2, X } from 'lucide-react';
import { supabase } from '../services/supabase';

const Settings: React.FC = () => {
  const { profile, updateProfile, t, syncData, isSyncing, refreshData } = useAppContext();
  const { signOut, user } = useAuth();
  const [formData, setFormData] = useState(profile);
  const [isSaved, setIsSaved] = useState(false);
  const [hasSupabase, setHasSupabase] = useState(false);

  // Modal States
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setFormData(profile);
    setHasSupabase(!!supabase);
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

  const handleResetData = async () => {
    await storage.clearAllUserData();
    refreshData();
    setShowResetConfirm(false);
    // Reload to ensure state is clean
    window.location.reload();
  };

  const handleDeleteAccount = async () => {
    // 1. Wipe data
    await storage.clearAllUserData();
    // 2. Sign out
    await signOut();
    setShowDeleteConfirm(false);
    // Reload happens automatically on auth state change in App.tsx
  };

  return (
    <div className="p-4 pb-24 min-h-screen relative">
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <SettingsIcon className="text-muted" />
        {t('settings', 'title')}
      </h1>

      {/* Account Section */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
          <User size={16} />
          Account
        </h2>
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-white font-medium">{user?.email || "Guest User"}</div>
            <div className="text-xs text-muted">{user ? "Logged in securely" : "Local session"}</div>
          </div>
          <button 
            onClick={() => signOut()}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </section>

      {/* Cloud Sync Section */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
          <Cloud size={16} />
          Cloud Sync
        </h2>
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
             <div className="flex items-center gap-2">
               <div className={`w-2.5 h-2.5 rounded-full ${hasSupabase ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`}></div>
               <span className="text-sm text-white font-medium">
                 {hasSupabase ? 'Supabase Connected' : 'Not Configured'}
               </span>
             </div>
             {hasSupabase && (
               <button 
                onClick={syncData} 
                disabled={isSyncing}
                className="p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 transition-colors disabled:opacity-50"
               >
                 <RefreshCw size={16} className={`${isSyncing ? 'animate-spin text-primary' : 'text-white'}`} />
               </button>
             )}
          </div>
          <p className="text-xs text-muted leading-relaxed">
            {hasSupabase 
              ? "Your data is automatically backed up to the cloud. Click the refresh button to force a sync manually." 
              : "Connect your Supabase database to enable cloud backup and multi-device sync."}
          </p>
        </div>
      </section>

      {/* Language Section */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
          <Globe size={16} />
          {t('settings', 'general')}
        </h2>
        <div className="bg-surface border border-border rounded-xl p-4">
          <label className="block text-sm text-gray-400 mb-2">{t('settings', 'language')}</label>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => updateProfile({ language: 'en' })}
              className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${profile.language === 'en' ? 'bg-primary text-background' : 'bg-zinc-800 text-gray-300'}`}
            >
              English
            </button>
            <button 
              onClick={() => updateProfile({ language: 'zh' })}
              className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${profile.language === 'zh' ? 'bg-primary text-background' : 'bg-zinc-800 text-gray-300'}`}
            >
              中文
            </button>
          </div>
        </div>
      </section>

      {/* Personal Data Section */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
          <User size={16} />
          {t('settings', 'personalData')}
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

          <button 
            onClick={handleSave}
            className={`w-full mt-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              isSaved 
              ? 'bg-green-500/20 text-green-500 border border-green-500/50' 
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
      </section>

      {/* Danger Zone */}
      <section>
        <h2 className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <AlertTriangle size={16} />
          {t('settings', 'dangerZone')}
        </h2>
        <div className="bg-red-950/20 border border-red-900/50 rounded-xl p-4 space-y-3">
           <button 
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-3 bg-red-900/20 border border-red-800/50 text-red-400 rounded-lg hover:bg-red-900/40 hover:text-red-300 transition-colors flex items-center justify-center gap-2 text-sm font-bold"
           >
             <Database size={16} />
             {t('settings', 'resetData')}
           </button>
           
           <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-3 bg-transparent border border-red-800/30 text-red-500/70 rounded-lg hover:bg-red-900/10 hover:text-red-400 transition-colors flex items-center justify-center gap-2 text-xs font-mono"
           >
             <Trash2 size={14} />
             {t('settings', 'deleteAccount')}
           </button>
        </div>
      </section>

      {/* Confirmation Modal Component */}
      {(showResetConfirm || showDeleteConfirm) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-surface border border-red-500/30 w-full max-w-sm rounded-2xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.2)] relative">
              <button 
                onClick={() => { setShowResetConfirm(false); setShowDeleteConfirm(false); }}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white"
              >
                <X size={20} />
              </button>

              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                <AlertTriangle size={32} className="text-red-500" />
              </div>

              <h2 className="text-xl font-bold text-white text-center mb-2">
                {showResetConfirm ? t('settings', 'confirmResetTitle') : t('settings', 'confirmDeleteTitle')}
              </h2>
              
              <p className="text-muted text-sm text-center mb-6 leading-relaxed">
                {showResetConfirm ? t('settings', 'confirmResetBody') : t('settings', 'confirmDeleteBody')}
              </p>

              <div className="space-y-3">
                <button 
                  onClick={showResetConfirm ? handleResetData : handleDeleteAccount}
                  className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-500 transition-colors shadow-lg shadow-red-900/20"
                >
                  {t('settings', 'confirm')}
                </button>
                <button 
                  onClick={() => { setShowResetConfirm(false); setShowDeleteConfirm(false); }}
                  className="w-full py-3 bg-transparent text-zinc-400 font-medium rounded-xl hover:text-white transition-colors"
                >
                  {t('settings', 'cancel')}
                </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

const SettingsIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);

export default Settings;
