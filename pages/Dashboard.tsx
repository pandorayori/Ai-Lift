import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Zap, Scale, Calendar, RefreshCw } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

const StatCard = ({ title, value, unit, icon: Icon, colorClass }: any) => (
  <div className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between shadow-sm">
    <div>
      <p className="text-muted text-[10px] font-bold uppercase tracking-wider">{title}</p>
      <div className="flex items-baseline mt-1">
        <span className="text-2xl font-bold text-white">{value}</span>
        {unit && <span className="text-xs text-gray-500 ml-1 font-medium">{unit}</span>}
      </div>
    </div>
    <div className={`p-2.5 rounded-full bg-opacity-10 ${colorClass.replace('text-', 'bg-')}`}>
      <Icon className={`${colorClass}`} size={18} />
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { profile, t, logs, isSyncing } = useAppContext();

  const volumeData = useMemo(() => {
    // Reverse logs so the chart goes from left (old) to right (new)
    // Take up to last 10
    const sorted = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sorted.slice(-10).map(log => ({
      date: new Date(log.date).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }),
      volume: Math.round(log.total_volume)
    }));
  }, [logs]);

  const recentVolume = logs.length > 0 ? logs[logs.length - 1].total_volume : 0;
  const totalWorkouts = logs.length;

  return (
    <div className="p-4 space-y-6 pb-24">
      <header className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('dashboard', 'greeting')}, {profile.name.split(' ')[0]}</h1>
          <p className="text-muted text-sm flex items-center gap-2">
            {t('dashboard', 'subtitle')}
            {isSyncing && <RefreshCw className="animate-spin text-primary" size={12} />}
          </p>
        </div>
        <div className="w-10 h-10 bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-full flex items-center justify-center text-white font-bold border border-zinc-600 shadow">
            {profile.name[0]}
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard title={t('dashboard', 'workouts')} value={totalWorkouts} unit="" icon={Calendar} colorClass="text-blue-500" />
        <StatCard title={t('dashboard', 'lastVolume')} value={(recentVolume / 1000).toFixed(1)} unit="k" icon={Activity} colorClass="text-primary" />
        <StatCard title={t('dashboard', 'weight')} value={profile.weight} unit="kg" icon={Scale} colorClass="text-secondary" />
        <StatCard title={t('dashboard', 'est1rm')} value="--" unit="kg" icon={Zap} colorClass="text-purple-500" />
      </div>

      {/* Volume Chart */}
      <div className="bg-surface border border-border rounded-xl p-4 shadow-sm">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm">
          <Activity size={16} className="text-primary" />
          {t('dashboard', 'volumeTrend')}
        </h2>
        <div className="h-48 w-full">
          {logs.length > 1 ? (
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
                  interval="preserveStartEnd"
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '12px'}}
                  itemStyle={{color: '#fff'}}
                  cursor={{stroke: '#3f3f46', strokeWidth: 1}}
                />
                <Area type="monotone" dataKey="volume" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorVol)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted text-xs">
              <Activity size={32} className="mb-2 opacity-20" />
              {t('dashboard', 'workouts') === 'Workouts' ? 'Start your first workout to see data' : '开始第一次训练以查看数据'}
            </div>
          )}
        </div>
      </div>

      {/* Simple History List Placeholder */}
      <div className="bg-surface border border-border rounded-xl p-4">
         <h2 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm">
          <Calendar size={16} className="text-secondary" />
          {t('dashboard', 'consistency')}
        </h2>
        {logs.length === 0 ? (
           <p className="text-xs text-muted text-center py-4">No history yet.</p>
        ) : (
          <div className="space-y-3">
             {logs.slice().reverse().slice(0, 3).map(log => (
               <div key={log.id} className="flex justify-between items-center text-sm border-b border-zinc-800 pb-2 last:border-0">
                 <div>
                   <div className="text-white font-medium">{log.name}</div>
                   <div className="text-xs text-muted">{new Date(log.date).toLocaleDateString()}</div>
                 </div>
                 <div className="text-right">
                    <div className="text-primary font-mono">{Math.round(log.total_volume)} kg</div>
                    <div className="text-xs text-muted">{log.duration_minutes} min</div>
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;