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
    <header className="sticky top-0 z-50 w-full border-b border-[#35383E]/65 bg-[#030406]/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div 
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="relative flex items-center justify-center w-9 h-9 rounded border border-[#8F9196]/55 bg-[#1F2023]/40 group-hover:border-[#BEC7D7] transition-colors duration-200">
            <Crosshair className="w-4 h-4 text-[#BEC7D7] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-base tracking-wider text-[#E4E2E3] uppercase">
                Aim<span className="text-[#BEC7D7]">GOD</span>
              </span>
              <Badge variant="cyan" size="sm" pulse>
                TRAINING LAB
              </Badge>
            </div>
            <p className="text-[10px] font-mono text-[#9FA4AE] tracking-widest uppercase -mt-0.5">
              3D PRECISION PLATFORM
            </p>
          </div>
        </div>

        {/* Screen Switcher Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-transparent p-1 rounded border border-[#35383E]/70">
          {navItems.map((item) => {
            const isActive =
              currentScreen === item.screen ||
              (item.screen === 'arena' && currentScreen === 'arena_ready');
            return (
              <button
                key={item.screen}
                onClick={() => onNavigate(item.screen)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-sm text-xs font-display tracking-wider font-semibold uppercase transition-colors duration-150 cursor-pointer border ${
                  isActive
                    ? 'bg-[#2A2B2F]/55 text-[#E4E2E3] border-[#8F9196]'
                    : 'text-[#9FA4AE] hover:text-[#E4E2E3] hover:bg-[#1F2023]/35 border-transparent'
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
            <div className="flex items-center gap-2.5 bg-transparent border border-[#35383E]/70 rounded py-1 px-3">
              <div className="w-2 h-2 rounded-full bg-[#BEC7D7]" />
              <div className="text-left hidden sm:block">
                <span className="text-xs font-display font-semibold text-[#E4E2E3] block uppercase tracking-wide">
                  {user.username}
                </span>
                <span className="text-[10px] font-mono text-[#9FA4AE] block -mt-0.5">
                  ID: #{user.id.substring(0, 6)}
                </span>
              </div>
              <button
                onClick={onToggleAuth}
                title="Simulate Logout / Switch Account"
                className="text-[11px] text-[#9FA4AE] hover:text-[#E4E2E3] font-mono underline underline-offset-4 ml-1 cursor-pointer"
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
            className="p-1.5 rounded bg-transparent hover:bg-[#1F2023]/50 border border-[#35383E]/70 hover:border-[#8F9196] text-[#9FA4AE] hover:text-[#E4E2E3] transition-colors cursor-pointer"
            title={user.isLoggedIn ? "Switch to Logged Out mode" : "Switch to Logged In mode"}
          >
            <UserCheck className={`w-4 h-4 ${user.isLoggedIn ? 'text-[#BEC7D7]' : 'text-[#6e737c]'}`} />
          </button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden flex items-center justify-around py-2 border-t border-[#35383E]/60 bg-[#030406]/80 px-2 overflow-x-auto">
        {navItems.map((item) => {
          const isActive =
              currentScreen === item.screen ||
              (item.screen === 'arena' && currentScreen === 'arena_ready');
          return (
            <button
              key={item.screen}
              onClick={() => onNavigate(item.screen)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-display uppercase tracking-wider ${
                isActive ? 'text-[#E4E2E3] bg-[#2A2B2F]/55 border border-[#8F9196] font-bold' : 'text-[#9FA4AE]'
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
