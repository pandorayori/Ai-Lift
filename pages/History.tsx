import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { storage } from '../services/storageService';
import { Calendar, Trash2, Clock, Activity, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const History: React.FC = () => {
  const { logs, t, language, refreshData, exercises } = useAppContext();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Sort by date descending (newest first)
  const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm(t('history', 'deleteConfirm'))) {
      await storage.deleteWorkoutLog(id);
      refreshData();
    }
  };

  const getExerciseName = (exId: string) => {
    const ex = exercises.find(e => e.id === exId);
    if (!ex) return 'Unknown Exercise';
    return language === 'zh' && ex.name_zh ? ex.name_zh : ex.name;
  };

  return (
    <div className="p-4 pb-24 min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="p-2 bg-surface border border-border rounded-full text-muted hover:text-white transition-colors">
            <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-white">{t('history', 'title')}</h1>
      </div>

      {sortedLogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted">
          <Calendar size={48} className="mb-4 opacity-20" />
          <p>{t('history', 'empty')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedLogs.map(log => (
            <div 
              key={log.id} 
              className={`bg-surface border border-border rounded-xl overflow-hidden transition-all ${expandedId === log.id ? 'ring-1 ring-primary' : ''}`}
            >
              {/* Card Header (Clickable) */}
              <div 
                className="p-4 flex flex-col gap-3 cursor-pointer"
                onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white text-lg">{log.name}</h3>
                    <div className="text-xs text-muted flex items-center gap-2 mt-1">
                      <Calendar size={12} />
                      {new Date(log.date).toLocaleDateString() + ' ' + new Date(log.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                  <button 
                    onClick={(e) => handleDelete(e, log.id)}
                    className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="flex gap-4">
                   <div className="flex items-center gap-1.5 text-sm text-gray-300">
                     <Activity size={16} className="text-primary" />
                     <span className="font-mono">{Math.round(log.total_volume)}kg</span>
                   </div>
                   <div className="flex items-center gap-1.5 text-sm text-gray-300">
                     <Clock size={16} className="text-secondary" />
                     <span className="font-mono">{log.duration_minutes}m</span>
                   </div>
                   <div className="ml-auto text-muted">
                      {expandedId === log.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                   </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === log.id && (
                <div className="border-t border-border bg-zinc-900/50 p-4 space-y-4 animate-in slide-in-from-top-2">
                  {log.exercises.map(exLog => (
                    <div key={exLog.id}>
                      <div className="text-sm font-bold text-primary mb-2">
                        {getExerciseName(exLog.exercise_id)}
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs text-muted font-medium mb-1 px-2">
                        <div className="text-left">{t('workout', 'set')}</div>
                        <div className="text-center">{t('workout', 'kg')}</div>
                        <div className="text-center">{t('workout', 'reps')}</div>
                        <div className="text-right">1RM(est)</div>
                      </div>
                      <div className="space-y-1">
                        {exLog.sets.map((set, idx) => (
                           <div key={set.id} className="grid grid-cols-4 gap-2 text-sm text-gray-300 bg-zinc-800/50 rounded-md py-1.5 px-2">
                             <div className="text-left text-zinc-500 font-mono">{idx + 1}</div>
                             <div className="text-center font-mono">{set.weight}</div>
                             <div className="text-center font-mono">{set.reps}</div>
                             <div className="text-right font-mono text-zinc-500">
                               {Math.round(set.weight * (1 + set.reps / 30))}
                             </div>
                           </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;