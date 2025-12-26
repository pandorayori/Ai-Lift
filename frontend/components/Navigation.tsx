import React from 'react';
import { LayoutDashboard, Dumbbell, Sparkles, BookOpen, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';

const NavItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link to={to} className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${active ? 'text-primary' : 'text-muted hover:text-gray-300'}`}>
    <Icon size={24} strokeWidth={active ? 2.5 : 2} />
    <span className="text-[10px] mt-1 font-medium">{label}</span>
  </Link>
);

const Navigation: React.FC = () => {
  const location = useLocation();
  const { t } = useAppContext();
  
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-surface/90 backdrop-blur-lg border-t border-border z-50 h-[80px] pb-4">
      <div className="flex justify-around items-center h-full max-w-2xl mx-auto px-2">
        <NavItem to="/" icon={LayoutDashboard} label={t('nav', 'dashboard')} active={location.pathname === '/'} />
        <NavItem to="/exercises" icon={BookOpen} label={t('nav', 'library')} active={location.pathname === '/exercises'} />
        <NavItem to="/workout" icon={Dumbbell} label={t('nav', 'workout')} active={location.pathname === '/workout'} />
        <NavItem to="/coach" icon={Sparkles} label={t('nav', 'coach')} active={location.pathname === '/coach'} />
        <NavItem to="/settings" icon={Settings} label={t('nav', 'settings')} active={location.pathname === '/settings'} />
      </div>
    </nav>
  );
};

export default Navigation;