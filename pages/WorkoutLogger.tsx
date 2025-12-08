import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Play, Plus } from 'lucide-react';

const WorkoutLogger: React.FC = () => {
  const { t } = useAppContext();

  return (
    <div className="p-4 pb-24 min-h-screen flex flex-col items-center justify-center text-center">
      <div className="bg-surface border border-border p-8 rounded-2xl max-w-sm w-full">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
          <Play size={32} fill="currentColor" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">{t('workout', 'startTitle')}</h1>
        <p className="text-muted text-sm mb-6">{t('workout', 'startSubtitle')}</p>
        
        <button className="w-full py-3 bg-primary text-background font-bold rounded-xl hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2">
          <Plus size={20} />
          {t('workout', 'startBtn')}
        </button>
      </div>
    </div>
  );
};

export default WorkoutLogger;