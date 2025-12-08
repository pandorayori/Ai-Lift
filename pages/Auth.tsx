import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Dumbbell, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

const Auth: React.FC = () => {
  const { signIn, signUp } = useAuth();
  // We can access 't' from AppContext only if AppContext wraps this, 
  // but usually AppContext depends on Auth. 
  // For safety in this specific hierarchy, we'll hardcode labels or manage simple i18n here or assume AppContext is safe.
  // Given the structure in App.tsx (Auth -> App), we cannot use useAppContext here easily if AppProvider is inside.
  // Let's use simple English/Chinese toggle local state or just default to English/System for Auth to avoid circular dep.
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
        // For Supabase, if email confirm is off, it auto logs in. 
        // If on, we might need to tell user to check email.
        // Assuming default behavior for this demo.
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-white">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary mb-4">
             <Dumbbell size={32} fill="currentColor" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-muted text-sm mt-2 text-center">
            {isLogin 
              ? 'Enter your credentials to access your workouts' 
              : 'Start your strength journey with AI-Lift today'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted uppercase">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-zinc-500" size={18} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-primary focus:outline-none transition-colors"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted uppercase">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-zinc-500" size={18} />
              <input 
                type="password" 
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-primary focus:outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-xs text-center">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-background font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                {isLogin ? 'Sign In' : 'Sign Up'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
