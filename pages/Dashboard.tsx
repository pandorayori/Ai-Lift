import React, { useMemo } from 'react';
import { storage } from '../services/storageService';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Zap, Scale, Calendar } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

const StatCard = ({ title, value, unit, icon: Icon, colorClass }: any) => (
  <div className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between">
    <div>
      <p className="text-muted text-xs font-semibold uppercase tracking-wider">{title}</p>
      <div className="flex items-baseline mt-1">
        <span className="text-2xl font-bold text-white">{value}</span>
        {unit && <span className="text-sm text-gray-500 ml-1">{unit}</span>}
      </div>
    </div>
    <div className={`p-3 rounded-full bg-opacity-10 ${colorClass.replace('text-', 'bg-')}`}>
      <Icon className={`${colorClass}`} size={20} />
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { profile, t } = useAppContext();
  // We still fetch logs directly from storage as they aren't part of the global "settings" state context yet
  const logs = storage.getWorkoutLogs(); 

  const volumeData = useMemo(() => {
    return logs.map(log => ({
      date: new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      volume: Math.round(log.total_volume)
    })).slice(-10); // Last 10 sessions
  }, [logs]);

  const recentVolume = logs.length > 0 ? logs[logs.length - 1].total_volume : 0;
  const totalWorkouts = logs.length;

  return (
    <div className="p-4 space-y-6 pb-24">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('dashboard', 'greeting')}, {profile.name.split(' ')[0]}</h1>
          <p className="text-muted text-sm">{t('dashboard', 'subtitle')}</p>
        </div>
        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
            {profile.name[0]}
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard title={t('dashboard', 'workouts')} value={totalWorkouts} unit="" icon={Calendar} colorClass="text-blue-500" />
        <StatCard title={t('dashboard', 'lastVolume')} value={(recentVolume / 1000).toFixed(1)} unit="k" icon={Activity} colorClass="text-primary" />
        <StatCard title={t('dashboard', 'weight')} value={profile.weight} unit="kg" icon={Scale} colorClass="text-secondary" />
        <StatCard title={t('dashboard', 'est1rm')} value="145" unit="kg" icon={Zap} colorClass="text-purple-500" />
      </div>

      {/* Volume Chart */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Activity size={18} className="text-primary" />
          {t('dashboard', 'volumeTrend')}
        </h2>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={volumeData}>
              <defs>
                <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                tick={{fontSize: 10, fill: '#71717a'}} 
                axisLine={false} 
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip 
                contentStyle={{backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px'}}
                itemStyle={{color: '#fff'}}
                cursor={{stroke: '#3f3f46', strokeWidth: 1}}
              />
              <Area type="monotone" dataKey="volume" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorVol)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heatmap Placeholder */}
      <div className="bg-surface border border-border rounded-xl p-4">
         <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-secondary" />
          {t('dashboard', 'consistency')}
        </h2>
        <div className="flex gap-1 flex-wrap">
          {Array.from({ length: 90 }).map((_, i) => (
             <div 
               key={i} 
               className={`w-2.5 h-2.5 rounded-sm ${Math.random() > 0.7 ? 'bg-primary' : 'bg-zinc-800'}`}
             ></div>
          ))}
        </div>
        <p className="text-xs text-muted mt-3 text-right">{t('dashboard', 'last3months')}</p>
      </div>
    </div>
  );
};

export default Dashboard;