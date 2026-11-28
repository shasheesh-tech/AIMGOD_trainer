import React, { useState, useEffect, useCallback } from 'react';
import { Screen, SessionConfig, SessionResult, UserProfile, CUSTOM_SIZE_DEFAULT_MM, DEFAULT_CROSSHAIR } from './types';
import { Navbar } from './components/layout/Navbar';
import { Shell } from './components/layout/Shell';
import { IntroOverlay } from './components/intro/IntroOverlay';
import { DashboardScreen } from './features/dashboard/DashboardScreen';
import { ArenaReadyScreen } from './features/arena/ArenaReadyScreen';
import { ArenaScreen } from './features/arena/ArenaScreen';
import { ResultsScreen } from './features/results/ResultsScreen';
import { HistoryScreen } from './features/history/HistoryScreen';
import { AuthPlaceholderScreen } from './features/auth/AuthPlaceholderScreen';

const LOCAL_STORAGE_KEY = 'aimgod_trainer_sessions_v2';
const INTRO_SEEN_SESSION_KEY = 'aimgod_intro_seen_v1';

export const App: React.FC = () => {
  const [introActive, setIntroActive] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(INTRO_SEEN_SESSION_KEY) !== 'true';
    } catch {
      return true;
    }
  });
  const [dashboardRevealed, setDashboardRevealed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(INTRO_SEEN_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const handleRevealDashboard = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_SEEN_SESSION_KEY, 'true');
    } catch {
      // ignore storage errors
    }
    setDashboardRevealed(true);
  }, []);

  const handleIntroComplete = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_SEEN_SESSION_KEY, 'true');
    } catch {
      // ignore storage errors
    }
    setDashboardRevealed(true);
    setIntroActive(false);
  }, []);

  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  // Increment key to fully remount ArenaScreen (reset all state) on each new session
  const [arenaSessionKey, setArenaSessionKey] = useState<number>(1);

  // Default Session Configuration — includes customSizeMm
  const [sessionConfig, setSessionConfig] = useState<SessionConfig>({
    mode: 'static_practice',
    duration: 30,
    targetShape: 'sphere',
    targetSize: 'medium',
    customSizeMm: CUSTOM_SIZE_DEFAULT_MM,
    arenaTheme: 'cyber_dark',
    crosshair: DEFAULT_CROSSHAIR,
  });

  const [lastResult, setLastResult] = useState<SessionResult | null>(null);

  // History with localStorage persistence
  const [sessionHistory, setSessionHistory] = useState<SessionResult[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved) as SessionResult[];
    } catch {
      // ignore parse errors
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessionHistory));
    } catch {
      // ignore write errors
    }
  }, [sessionHistory]);

  // User Profile (local mock)
  const [user, setUser] = useState<UserProfile>({
    id: 'usr_aimgod1',
    email: 'pro_aimer@aimgod.lab',
    username: 'PRO_AIMER',
    isLoggedIn: true,
  });

  const handleUpdateConfig = (partial: Partial<SessionConfig>) => {
    setSessionConfig((prev) => ({ ...prev, ...partial }));
  };

  /** Dashboard "Enter Arena" → go to the ready screen */
  const handleEnterArena = () => {
    setCurrentScreen('arena_ready');
  };

  /** Ready screen "Start Session" → remount arena with countdown */
  const handleStartSession = () => {
    setArenaSessionKey((k) => k + 1);
    setCurrentScreen('arena');
  };

  const handleFinishSession = (result: SessionResult) => {
    setLastResult(result);
    setSessionHistory((prev) => [result, ...prev]);
    setCurrentScreen('results');
  };

  /** Results "Retry" → remount arena fresh */
  const handleRetrySession = () => {
    setArenaSessionKey((k) => k + 1);
    setCurrentScreen('arena');
  };

  const handleReturnDashboard = () => {
    setCurrentScreen('dashboard');
  };

  const handleToggleAuth = () => {
    setUser((prev) => ({ ...prev, isLoggedIn: !prev.isLoggedIn }));
  };

  const handleLoginSuccess = (u: UserProfile) => {
    setUser(u);
    setCurrentScreen('dashboard');
  };

  /**
   * Nav-bar "Arena" click:
   * - If currently playing → go to ready screen (don't reset the arena key)
   * - Otherwise → go to ready screen
   * In either case, gameplay only begins when "Start Session" is pressed.
   */
  const handleNavigate = (screen: Screen) => {
    if (screen === 'arena') {
      setCurrentScreen('arena_ready');
    } else {
      setCurrentScreen(screen);
    }
  };

  return (
    <>
      {introActive && (
        <IntroOverlay
          onRevealDashboard={handleRevealDashboard}
          onComplete={handleIntroComplete}
        />
      )}

      <div
        aria-hidden={!dashboardRevealed}
        className={`min-h-screen bg-[#030406] text-slate-100 flex flex-col font-sans selection:bg-brand-cyan/20 selection:text-brand-cyan ${
          !dashboardRevealed
            ? 'hidden pointer-events-none select-none'
            : introActive
            ? 'pointer-events-none select-none'
            : ''
        }`}
      >
        <Navbar
          currentScreen={currentScreen}
          onNavigate={handleNavigate}
          user={user}
          onToggleAuth={handleToggleAuth}
        />

        <Shell>
          {currentScreen === 'dashboard' && (
            <DashboardScreen
              config={sessionConfig}
              onUpdateConfig={handleUpdateConfig}
              onStartTraining={handleEnterArena}
              onViewHistory={() => setCurrentScreen('history')}
            />
          )}

          {currentScreen === 'arena_ready' && (
            <ArenaReadyScreen
              config={sessionConfig}
              onStartSession={handleStartSession}
              onBackToDashboard={handleReturnDashboard}
            />
          )}

          {currentScreen === 'arena' && (
            <ArenaScreen
              key={arenaSessionKey}
              config={sessionConfig}
              onFinishSession={handleFinishSession}
              onExit={() => setCurrentScreen('arena_ready')}
            />
          )}

          {currentScreen === 'results' && (
            <ResultsScreen
              result={lastResult}
              onRetry={handleRetrySession}
              onReturnDashboard={handleReturnDashboard}
              onViewHistory={() => setCurrentScreen('history')}
            />
          )}

          {currentScreen === 'history' && (
            <HistoryScreen
              history={sessionHistory}
              onStartNewSession={handleReturnDashboard}
            />
          )}

          {currentScreen === 'auth' && (
            <AuthPlaceholderScreen
              onLoginSuccess={handleLoginSuccess}
              onContinueGuest={handleReturnDashboard}
            />
          )}
        </Shell>
      </div>
    </>
  );
};

export default App;
