import React from 'react';
import { Crosshair, LayoutDashboard, Target, Trophy, History, UserCheck, LogIn } from 'lucide-react';
import { Screen, UserProfile } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface NavbarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  user: UserProfile;
  onToggleAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onNavigate,
  user,
  onToggleAuth,
}) => {
  const navItems: { screen: Screen; label: string; icon: React.ReactNode }[] = [
    { screen: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { screen: 'arena', label: 'Arena', icon: <Target className="w-4 h-4" /> },
    { screen: 'results', label: 'Results', icon: <Trophy className="w-4 h-4" /> },
    { screen: 'history', label: 'History', icon: <History className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-dark-750/80 bg-dark-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div 
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-dark-900 border border-brand-cyan/40 group-hover:border-brand-cyan group-hover:shadow-glow-cyan-sm transition-all duration-300">
            <Crosshair className="w-5 h-5 text-brand-cyan transition-transform duration-300 group-hover:scale-110 group-hover:rotate-45" />
            <div className="absolute -inset-0.5 rounded-lg bg-brand-cyan/10 blur-sm group-hover:bg-brand-cyan/20 transition-all" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-lg tracking-wider text-slate-100 uppercase">
                Aim<span className="text-brand-cyan">GOD</span>
              </span>
              <Badge variant="cyan" size="sm" pulse>
                TRAINING LAB
              </Badge>
            </div>
            <p className="text-[10px] font-mono text-slate-400 tracking-wider uppercase -mt-0.5">
              3D PRECISION PLATFORM
            </p>
          </div>
        </div>

        {/* Screen Switcher Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-dark-900/90 p-1 rounded-xl border border-dark-800">
          {navItems.map((item) => {
            const isActive =
              currentScreen === item.screen ||
              (item.screen === 'arena' && currentScreen === 'arena_ready');
            return (
              <button
                key={item.screen}
                onClick={() => onNavigate(item.screen)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-display tracking-wider font-semibold uppercase transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/40 shadow-glow-cyan-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-dark-800/80 border border-transparent'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Auth Info & Screen Quick Links */}
        <div className="flex items-center gap-3">
          {user.isLoggedIn ? (
            <div className="flex items-center gap-2.5 bg-dark-900/90 border border-dark-750 rounded-lg py-1 px-3">
              <div className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
              <div className="text-left hidden sm:block">
                <span className="text-xs font-display font-semibold text-slate-200 block uppercase tracking-wide">
                  {user.username}
                </span>
                <span className="text-[10px] font-mono text-brand-cyan block -mt-0.5">
                  ID: #{user.id.substring(0, 6)}
                </span>
              </div>
              <button
                onClick={onToggleAuth}
                title="Simulate Logout / Switch Account"
                className="text-[11px] text-slate-400 hover:text-brand-rose font-mono underline ml-1 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              icon={<LogIn className="w-3.5 h-3.5" />}
              onClick={() => onNavigate('auth')}
            >
              Sign In
            </Button>
          )}

          {/* Direct Auth Toggle for testing in Stage 1 */}
          <button
            onClick={onToggleAuth}
            className="p-1.5 rounded-lg bg-dark-850 hover:bg-dark-800 border border-dark-750 text-slate-400 hover:text-brand-cyan transition-colors"
            title={user.isLoggedIn ? "Switch to Logged Out mode" : "Switch to Logged In mode"}
          >
            <UserCheck className={`w-4 h-4 ${user.isLoggedIn ? 'text-brand-emerald' : 'text-slate-500'}`} />
          </button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden flex items-center justify-around py-2 border-t border-dark-800 bg-dark-950/90 px-2 overflow-x-auto">
        {navItems.map((item) => {
          const isActive =
              currentScreen === item.screen ||
              (item.screen === 'arena' && currentScreen === 'arena_ready');
          return (
            <button
              key={item.screen}
              onClick={() => onNavigate(item.screen)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-display uppercase tracking-wider ${
                isActive ? 'text-brand-cyan bg-brand-cyan/15 font-bold' : 'text-slate-400'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
