
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Globe, Database, User, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Settings: React.FC = () => {
  const { profile, updateProfile, t } = useAppContext();

  return (
    <div className="p-4 pb-24 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <SettingsIcon className="text-muted" />
        {t('settings', 'title')}
      </h1>

      {/* Profile Link Section */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
          <User size={16} />
          {t('settings', 'personalData')}
        </h2>
        <Link to="/profile" className="block bg-surface border border-border rounded-xl p-4 hover:border-zinc-600 transition-colors group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-full flex items-center justify-center text-white font-bold border border-zinc-600 text-lg">
                {profile.name[0]}
              </div>
              <div>
                <h3 className="text-white font-medium text-lg">{t('settings', 'profile')}</h3>
                <p className="text-xs text-muted mt-1">{t('settings', 'profileDesc')}</p>
              </div>
            </div>
            <ChevronRight className="text-zinc-600 group-hover:text-primary transition-colors" size={20} />
          </div>
        </Link>
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

      {/* Danger Zone */}
      <section>
        <div className="p-4 border border-red-900/30 bg-red-900/10 rounded-xl">
           <h3 className="text-red-500 text-sm font-bold mb-2 flex items-center gap-2">
             <Database size={14} />
             {t('settings', 'dangerZone')}
           </h3>
           <button 
            onClick={() => {
              if(confirm("Reset all data? This cannot be undone.")) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="text-xs text-red-400 hover:text-red-300 underline"
           >
             {t('settings', 'resetData')}
           </button>
        </div>
      </section>
    </div>
  );
};

const SettingsIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);

export default Settings;
