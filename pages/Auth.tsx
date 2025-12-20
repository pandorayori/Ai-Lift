
import React, { useState } from 'react';
import { auth } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';
import { Dumbbell, Loader2, Mail, Lock, AlertCircle, ArrowRight, UserCircle } from 'lucide-react';

const Auth: React.FC = () => {
  const { continueAsGuest } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // In this local-only version, we simulate a successful login
      // In a real app with Supabase, you would use:
      // const { data, error } = isLogin ? await auth.signIn(email, password) : await auth.signUp(email, password);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Since backend/supabase is disabled, we directly authorize
      continueAsGuest(); 
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle Decorative Background */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>

        <div className="flex flex-col items-center mb-10 relative">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl flex items-center justify-center text-background mb-4 shadow-lg shadow-primary/20 rotate-3 transition-transform hover:rotate-0">
            <Dumbbell size={40} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">AI-Lift</h1>
          <p className="text-muted text-sm mt-1 font-medium">Smart Strength Training Tracker</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted ml-1 uppercase tracking-wider">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-zinc-500" size={18} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-primary focus:bg-zinc-900 transition-all placeholder:text-zinc-600"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted ml-1 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-zinc-500" size={18} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-primary focus:bg-zinc-900 transition-all placeholder:text-zinc-600"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 mt-4 shadow-xl active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-surface px-4 text-muted font-bold tracking-widest">Or</span>
          </div>
        </div>

        {/* Primary Guest Entry */}
        <button 
          onClick={continueAsGuest}
          className="w-full py-4 bg-zinc-900 border border-zinc-800 text-white font-bold rounded-2xl hover:bg-zinc-800 hover:border-zinc-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98] group"
        >
          <UserCircle size={22} className="text-primary group-hover:scale-110 transition-transform" />
          <span>Continue as Guest</span>
          <ArrowRight size={18} className="text-muted group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="mt-8 pt-6 border-t border-zinc-800/50 text-center">
          <p className="text-sm text-muted font-medium">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(null); }}
              className="ml-2 text-primary hover:text-primary-dark font-bold transition-colors"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
      
      {/* Footer info */}
      <div className="fixed bottom-6 text-center text-[10px] text-muted font-medium uppercase tracking-[0.2em]">
        Built with AI for Athletes
      </div>
    </div>
  );
};

export default Auth;
