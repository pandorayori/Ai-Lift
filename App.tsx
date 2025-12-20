
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import ExerciseLibrary from './pages/ExerciseLibrary';
import AICoach from './pages/AICoach';
import WorkoutLogger from './pages/WorkoutLogger';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import SmartPlan from './pages/SmartPlan';
import Auth from './pages/Auth';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const AppRoutes = () => {
  const { isAuthorized } = useAuth();

  if (!isAuthorized) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-background text-white font-sans selection:bg-primary selection:text-background">
      <div className="mx-auto max-w-2xl min-h-screen relative shadow-2xl shadow-black">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/exercises" element={<ExerciseLibrary />} />
          <Route path="/coach" element={<AICoach />} />
          <Route path="/workout" element={<WorkoutLogger />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/smart-plan" element={<SmartPlan />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Navigation />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </AppProvider>
    </AuthProvider>
  );
};

export default App;
