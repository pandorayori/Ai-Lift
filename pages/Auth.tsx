import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Dumbbell, Mail, Lock, Loader2, ArrowRight, User, LogIn, Cpu } from 'lucide-react';

interface AuthProps { onGuestLogin: () => void; }

const Auth: React.FC<AuthProps> = ({ onGuestLogin }) => {
  const { signIn, signUp } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setLoading(true);
    try {
      if (activeTab === 'login') await signIn(email, password);
      else await signUp(email, password);
    } catch (err: any) { setError(err.message || "Failed"); } 
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-background overflow-hidden">
      {/* Cyberpunk Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,_#8B5CF620_0%,_transparent_50%)]"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel border border-white/10 rounded-3xl shadow-2xl relative z-10 overflow-hidden backdrop-blur-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary via-primary to-accent"></div>
        
        {/* Tabs */}
        <div className="flex">
          <button onClick={() => setActiveTab('login')} className={`flex-1 py-5 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'login' ? 'text-primary bg-white/5' : 'text-muted hover:text-white'}`}>Log In</button>
          <button onClick={() => setActiveTab('register')} className={`flex-1 py-5 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'register' ? 'text-primary bg-white/5' : 'text-muted hover:text-white'}`}>Sign Up</button>
        </div>

        <div className="p-8 pt-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-surface to-black border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-500">
               <Cpu size={32} className="text-primary" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">AI-LIFT <span className="text-primary text-sm align-top">OS</span></h2>
            <p className="text-muted text-xs font-mono mt-2">SECURE_ACCESS_TERMINAL</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Identity</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 text-zinc-500 group-focus-within:text-primary transition-colors" size={18} />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 transition-all font-mono text-sm" placeholder="user@net.com" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Passcode</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 text-zinc-500 group-focus-within:text-primary transition-colors" size={18} />
                <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 transition-all font-mono text-sm" placeholder="••••••" />
              </div>
            </div>

            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-mono text-center">{error}</div>}

            <button type="submit" disabled={loading} className="w-full bg-white text-black hover:bg-primary font-bold py-4 rounded-xl transition-all mt-4 flex items-center justify-center gap-2 shadow-lg hover:shadow-[0_0_20px_rgba(204,255,0,0.3)]">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <>{activeTab === 'login' ? 'AUTHENTICATE' : 'INITIALIZE'} <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button onClick={onGuestLogin} className="text-xs font-mono text-zinc-500 hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-0.5">
              ENTER_GUEST_MODE_&gt;&gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;