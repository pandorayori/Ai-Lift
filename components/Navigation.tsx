import React from 'react';
import { LayoutDashboard, Dumbbell, Sparkles, BookOpen, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';

const NavItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link 
    to={to} 
    className={`relative flex flex-col items-center justify-center w-full h-full transition-all duration-300 group`}
  >
    {/* Active Glow Background */}
    {active && (
      <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-md" />
    )}
    
    <div className={`relative z-10 transition-transform duration-300 ${active ? '-translate-y-1' : ''}`}>
      <Icon 
        size={22} 
        strokeWidth={active ? 2.5 : 2} 
        className={`transition-colors duration-300 ${active ? 'text-primary drop-shadow-[0_0_8px_rgba(204,255,0,0.6)]' : 'text-muted group-hover:text-gray-300'}`} 
      />
    </div>
    
    {active && (
      <span className="absolute bottom-2 w-1 h-1 bg-primary rounded-full shadow-[0_0_5px_#CCFF00]" />
    )}
  </Link>
);

const Navigation: React.FC = () => {
  const location = useLocation();
  const { t } = useAppContext();
  
  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="glass-panel w-full max-w-sm mx-auto rounded-3xl h-[64px] px-2 flex justify-between items-center shadow-2xl shadow-black/50 pointer-events-auto border border-white/10">
        <NavItem to="/" icon={LayoutDashboard} label={t('nav', 'dashboard')} active={location.pathname === '/'} />
        <NavItem to="/exercises" icon={BookOpen} label={t('nav', 'library')} active={location.pathname === '/exercises'} />
        <NavItem to="/workout" icon={Dumbbell} label={t('nav', 'workout')} active={location.pathname === '/workout'} />
        <NavItem to="/coach" icon={Sparkles} label={t('nav', 'coach')} active={location.pathname === '/coach'} />
        <NavItem to="/settings" icon={Settings} label={t('nav', 'settings')} active={location.pathname === '/settings'} />
      </nav>
    </div>
  );
};

export default Navigation;