import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import ExerciseLibrary from './pages/ExerciseLibrary';
import AICoach from './pages/AICoach';
import WorkoutLogger from './pages/WorkoutLogger';
import Settings from './pages/Settings';
import Auth from './pages/Auth';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-primary">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-white font-sans selection:bg-primary selection:text-background">
      <div className="mx-auto max-w-2xl min-h-screen relative shadow-2xl shadow-black">
        <Routes>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/exercises" element={<ProtectedRoute><ExerciseLibrary /></ProtectedRoute>} />
          <Route path="/coach" element={<ProtectedRoute><AICoach /></ProtectedRoute>} />
          <Route path="/workout" element={<ProtectedRoute><WorkoutLogger /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
        {/* Only show nav if authenticated, handled by ProtectedRoute effectively but we can hide it in Auth */}
        <AuthCheckNav />
      </div>
    </div>
  );
};

const AuthCheckNav = () => {
  const { user } = useAuth();
  if (!user) return null;
  return <Navigation />;
}

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