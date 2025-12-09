import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Zap, Scale, Calendar, RefreshCw, ChevronRight, TrendingUp } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, unit, icon: Icon, colorClass, to }: any) => {
  const CardContent = (
    <div className="glass-card rounded-2xl p-4 flex flex-col justify-between h-28 relative overflow-hidden group hover:border-white/10 transition-all">
      <div className={`absolute -right-4 -top-4 w-20 h-20 bg-gradient-to-br ${colorClass.replace('text-', 'from-')}/20 to-transparent rounded-full blur-xl group-hover:blur-2xl transition-all duration-500`} />
      
      <div className="flex justify-between items-start z-10">
        <Icon className={`${colorClass} drop-shadow-md`} size={20} />
        {unit === 'kg' && <TrendingUp size={14} className="text-primary/50" />}
      </div>
      
      <div className="z-10">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold font-mono text-white tracking-tight">{value}</span>
          {unit && <span className="text-xs text-muted font-medium">{unit}</span>}
        </div>
        <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1 opacity-70">{title}</p>
      </div>
    </div>
  );

  return to ? <Link to={to} className="block active:scale-95 transition-transform">{CardContent}</Link> : CardContent;
};

const Dashboard: React.FC = () => {
  const { profile, t, logs, isSyncing } = useAppContext();

  const volumeData = useMemo(() => {
    const sorted = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sorted.slice(-10).map(log => ({
      date: new Date(log.date).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }),
      volume: Math.round(log.total_volume)
    }));
  }, [logs]);

  const recentVolume = logs.length > 0 ? logs[logs.length - 1].total_volume : 0;
  const totalWorkouts = logs.length;

  return (
    <div className="p-5 pb-32 space-y-6">
      
      {/* Header */}
      <header className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter italic">
            AI-LIFT <span className="text-primary">OS</span>
          </h1>
          <p className="text-muted text-xs font-mono mt-1 flex items-center gap-2">
            STATUS: <span className="text-primary">ONLINE</span>
            {isSyncing && <RefreshCw className="animate-spin text-primary" size={10} />}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-surface border border-white/10 flex items-center justify-center text-primary font-bold shadow-[0_0_15px_rgba(204,255,0,0.2)]">
            {profile.name[0]}
        </div>
      </header>

      {/* Hero Card: AI Insight */}
      <Link to="/coach" className="block relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary to-accent opacity-20 blur-xl rounded-3xl group-hover:opacity-30 transition-opacity" />
        <div className="glass-panel rounded-3xl p-5 relative border border-white/10 overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-20">
            <Zap size={64} className="text-white" />
          </div>
          <div className="relative z-10">
             <div className="flex items-center gap-2 mb-2">
               <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
               <span className="text-[10px] font-bold tracking-widest text-secondary uppercase">AI Coach Insight</span>
             </div>
             <h2 className="text-xl text-white font-medium leading-relaxed">
               "Your volume is up <span className="text-primary font-bold">12%</span> this week. Legs recovery is optimal."
             </h2>
             <div className="mt-4 flex items-center gap-2 text-xs text-muted group-hover:text-white transition-colors">
               Tap to chat <ChevronRight size={12} />
             </div>
          </div>
        </div>
      </Link>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard title={t('dashboard', 'workouts')} value={totalWorkouts} unit="" icon={Calendar} colorClass="text-accent" to="/history" />
        <StatCard title={t('dashboard', 'lastVolume')} value={(recentVolume / 1000).toFixed(1)} unit="k" icon={Activity} colorClass="text-primary" />
        <StatCard title={t('dashboard', 'weight')} value={profile.weight} unit="kg" icon={Scale} colorClass="text-purple-400" to="/settings" />
        <StatCard title={t('dashboard', 'est1rm')} value="--" unit="kg" icon={Zap} colorClass="text-pink-500" />
      </div>

      {/* Volume Chart */}
      <Link to="/history" className="block group">
        <div className="glass-panel rounded-3xl p-5 border border-white/5 transition-colors hover:border-white/10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-white font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
              <Activity size={16} className="text-primary" />
              {t('dashboard', 'volumeTrend')}
            </h2>
          </div>
          <div className="h-40 w-full">
            {logs.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeData}>
                  <defs>
                    <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#CCFF00" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#CCFF00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    tick={{fontSize: 10, fill: '#52525B', fontFamily: 'JetBrains Mono'}} 
                    axisLine={false} 
                    tickLine={false}
                    interval="preserveStartEnd"
                    dy={10}
                  />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#12161F', border: '1px solid #333', borderRadius: '8px', fontSize: '12px', fontFamily: 'JetBrains Mono'}}
                    itemStyle={{color: '#CCFF00'}}
                    cursor={{stroke: '#CCFF00', strokeWidth: 1, strokeDasharray: '4 4'}}
                  />
                  <Area type="monotone" dataKey="volume" stroke="#CCFF00" strokeWidth={2} fillOpacity={1} fill="url(#colorVol)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted text-xs font-mono">
                NO DATA AVAILABLE // START TRAINING
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Dashboard;