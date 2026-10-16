import React, { useState, useEffect } from 'react';
import { Screen, SessionConfig, SessionResult, UserProfile, CUSTOM_SIZE_DEFAULT_MM } from './types';
import { Navbar } from './components/layout/Navbar';
import { Shell } from './components/layout/Shell';
import { DashboardScreen } from './features/dashboard/DashboardScreen';
import { ArenaReadyScreen } from './features/arena/ArenaReadyScreen';
import { ArenaScreen } from './features/arena/ArenaScreen';
import { ResultsScreen } from './features/results/ResultsScreen';
import { HistoryScreen } from './features/history/HistoryScreen';
import { AuthPlaceholderScreen } from './features/auth/AuthPlaceholderScreen';

const LOCAL_STORAGE_KEY = 'aimgod_trainer_sessions_v2';

export const App: React.FC = () => {
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
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col font-sans selection:bg-brand-cyan/20 selection:text-brand-cyan">
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
  );
};

export default App;
