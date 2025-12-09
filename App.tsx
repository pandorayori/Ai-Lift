
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import ExerciseLibrary from './pages/ExerciseLibrary';
import AICoach from './pages/AICoach';
import WorkoutLogger from './pages/WorkoutLogger';
import Settings from './pages/Settings';
import Auth from './pages/Auth';
import History from './pages/History';
import Profile from './pages/Profile';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Loader2 } from 'lucide-react';

// 1. 全屏加载组件
const FullScreenLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-background text-primary">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <div className="text-xs text-muted font-mono uppercase tracking-widest">Loading AI-Lift...</div>
    </div>
  </div>
);

// 2. 主应用内容逻辑
const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [isGuestMode, setIsGuestMode] = useState(false);

  // 阶段 A: 正在检查登录状态
  if (loading) {
    return <FullScreenLoader />;
  }

  // 阶段 B: 未登录 且 未开启游客模式 -> 强制显示 Auth 页面
  if (!user && !isGuestMode) {
    return (
      <div className="min-h-screen bg-background text-white">
        <Auth onGuestLogin={() => setIsGuestMode(true)} />
      </div>
    );
  }

  // 阶段 C: 已登录 或 游客模式 -> 显示主应用 (路由 + 导航)
  return (
    <div className="min-h-screen bg-background text-white font-sans selection:bg-primary selection:text-background">
      <div className="mx-auto max-w-2xl min-h-screen relative shadow-2xl shadow-black bg-background flex flex-col">
        
        {/* 路由容器 - 占据剩余空间 */}
        <div className="flex-1 pb-24">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/workout" element={<WorkoutLogger />} />
            <Route path="/exercises" element={<ExerciseLibrary />} />
            <Route path="/coach" element={<AICoach />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            {/* 404 兜底跳转 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        {/* 底部导航栏 */}
        <Navigation />
        
      </div>
    </div>
  );
};

// 3. 根组件
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
