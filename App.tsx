import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import ExerciseLibrary from './pages/ExerciseLibrary';
import AICoach from './pages/AICoach';
import WorkoutLogger from './pages/WorkoutLogger';
import Settings from './pages/Settings';
import Auth from './pages/Auth';
import History from './pages/History'; // Import History
import { AppProvider } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Loader2 } from 'lucide-react';

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
          <Route path="/history" element={<History />} /> {/* Add History Route */}
        </Routes>
        
        {/* Always show Navigation */}
        <Navigation />

        {/* 
            CRITICAL: The Auth Modal Overlay
            If user is NOT logged in, this covers everything.
        */}
        {!user && <Auth />}
        
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