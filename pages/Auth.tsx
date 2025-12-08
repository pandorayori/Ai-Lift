import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Dumbbell, Mail, Lock, Loader2, ArrowRight, UserPlus, LogIn, User } from 'lucide-react';

interface AuthProps {
  onGuestLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onGuestLogin }) => {
  const { signIn, signUp } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (activeTab === 'login') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (err: any) {
      // Improve error messages for users
      if (err.message.includes('User already registered')) {
        setError("Account already exists. Please Log In.");
        setActiveTab('login');
      } else {
        setError(err.message || "Authentication failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // Modal Overlay: Covers the entire screen with a blurred background
    // Z-INDEX set to 999 to ensure it covers navigation and debug buttons
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden relative">
        
        {/* Header / Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => { setActiveTab('login'); setError(null); }}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'login' 
                ? 'bg-surface text-primary border-b-2 border-primary' 
                : 'bg-zinc-900/50 text-muted hover:text-gray-300'
            }`}
          >
            <LogIn size={18} />
            LOG IN
          </button>
          <button
            onClick={() => { setActiveTab('register'); setError(null); }}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'register' 
                ? 'bg-surface text-primary border-b-2 border-primary' 
                : 'bg-zinc-900/50 text-muted hover:text-gray-300'
            }`}
          >
            <UserPlus size={18} />
            SIGN UP
          </button>
        </div>

        <div className="p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary mb-3">
               <Dumbbell size={24} fill="currentColor" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              {activeTab === 'login' ? 'Welcome Back' : 'Join AI-Lift'}
            </h2>
            <p className="text-muted text-xs mt-1 text-center">
              {activeTab === 'login' 
                ? 'Continue your strength journey' 
                : 'Create an account to start tracking'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-zinc-500" size={16} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white focus:border-primary focus:outline-none transition-colors"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-zinc-500" size={16} />
                <input 
                  type="password" 
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white focus:border-primary focus:outline-none transition-colors"
                  placeholder="Min 6 characters"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-xs text-center animate-in slide-in-from-top-1">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-background font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  {activeTab === 'login' ? 'Enter App' : 'Create Account'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Guest Mode Button */}
          <div className="mt-6 pt-6 border-t border-zinc-800 text-center">
            <button 
              onClick={onGuestLogin}
              className="text-xs text-muted hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              <User size={14} />
              Continue as Guest (Preview Mode)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;