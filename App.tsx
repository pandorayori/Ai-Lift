import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import ExerciseLibrary from './pages/ExerciseLibrary';
import AICoach from './pages/AICoach';
import WorkoutLogger from './pages/WorkoutLogger';
import Settings from './pages/Settings';
import Auth from './pages/Auth';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Loader2, LogOut } from 'lucide-react';
import { supabase } from './services/supabase';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  // Show a full screen loader only during initial auth check
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-primary">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  const handleForceLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background text-white font-sans selection:bg-primary selection:text-background overflow-hidden relative">
      <div className="mx-auto max-w-2xl min-h-screen relative shadow-2xl shadow-black bg-background">
        
        {/* Render the App Routes normally in the background */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/exercises" element={<ExerciseLibrary />} />
          <Route path="/coach" element={<AICoach />} />
          <Route path="/workout" element={<WorkoutLogger />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
        
        {/* Always show Navigation */}
        <Navigation />

        {/* 
            CRITICAL: The Auth Modal Overlay
            If user is NOT logged in, this covers everything.
        */}
        {!user && <Auth />}
        
        {/* === DEBUG CONTROLS (If you see this, code is updated) === */}
        <div className="fixed bottom-24 right-4 z-[9999] flex flex-col items-end gap-2">
          <div className="bg-red-600 text-white text-[10px] px-2 py-1 rounded shadow-lg font-mono">
            v3.0 DEBUG MODE
          </div>
          {user && (
            <button 
              onClick={handleForceLogout}
              className="bg-red-600 text-white p-3 rounded-full shadow-xl border-2 border-white animate-pulse font-bold text-xs flex items-center gap-1"
            >
              <LogOut size={16} />
              FORCE LOGOUT
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <HashRouter>
          <AppContent />
        </HashRouter>
      </AppProvider>
    </AuthProvider>
  );
};

export default App;