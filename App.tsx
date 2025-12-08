import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import ExerciseLibrary from './pages/ExerciseLibrary';
import AICoach from './pages/AICoach';
import WorkoutLogger from './pages/WorkoutLogger';
import Settings from './pages/Settings';
import { AppProvider } from './contexts/AppContext';

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <div className="min-h-screen bg-background text-white font-sans selection:bg-primary selection:text-background">
          <div className="mx-auto max-w-2xl min-h-screen relative shadow-2xl shadow-black">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/exercises" element={<ExerciseLibrary />} />
              <Route path="/coach" element={<AICoach />} />
              <Route path="/workout" element={<WorkoutLogger />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
            <Navigation />
          </div>
        </div>
      </HashRouter>
    </AppProvider>
  );
};

export default App;