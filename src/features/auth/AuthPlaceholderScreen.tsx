import React, { useState } from 'react';
import { LogIn, UserPlus, Mail, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import { UserProfile } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { InteractiveParticleObject } from '../../components/three/InteractiveParticleObject';

interface AuthPlaceholderScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  onContinueGuest: () => void;
}

export const AuthPlaceholderScreen: React.FC<AuthPlaceholderScreenProps> = ({
  onLoginSuccess,
  onContinueGuest,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes('@')) {
      setError('Please provide a valid operative email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    // Stage 1 mock authentication success
    const username = email.split('@')[0].toUpperCase();
    onLoginSuccess({
      id: 'usr_' + Math.random().toString(36).substring(2, 8),
      email,
      username,
      isLoggedIn: true,
    });
  };

  return (
    <div className="relative max-w-md mx-auto py-8 animate-fade-in space-y-6">
      {/* Subtle non-blocking ambient 3D reticle behind auth header */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 w-72 h-72 z-0"
      >
        <InteractiveParticleObject
          variant="scope"
          scale={1.05}
          interactive={false}
          opacity={0.34}
          className="w-full h-full"
        />
      </div>

      {/* Brand Header */}
      <div className="relative z-10 text-center space-y-2">
        <Badge variant="cyan" size="md">
          STAGE 2 CLOUD INTEGRATION READY
        </Badge>
        <h1 className="text-3xl font-display font-black text-slate-100 uppercase tracking-wider">
          {mode === 'login' ? 'Operative Login' : 'Enlist Profile'}
        </h1>
        <p className="text-xs text-slate-400">
          Sign in to automatically sync your session history and custom target assets.
        </p>
      </div>

      {/* Auth Card */}
      <Card glow className="relative z-10 p-6">
        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-dark-950/80 rounded-lg border border-dark-800 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2 text-xs font-display font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40 shadow-glow-cyan-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`py-2 text-xs font-display font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40 shadow-glow-cyan-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-brand-rose/10 border border-brand-rose/40 text-brand-rose text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono text-slate-300 uppercase tracking-wide">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aimer@domain.com"
                className="w-full bg-dark-950/80 border border-dark-750 focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 outline-none transition-all font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono text-slate-300 uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-dark-950/80 border border-dark-750 focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 outline-none transition-all font-mono"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="md"
            icon={mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          >
            {mode === 'login' ? 'Authenticate' : 'Register Account'}
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-dark-800 text-center space-y-3">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Supabase integration will connect in Stage 5</span>
          </div>

          <button
            type="button"
            onClick={onContinueGuest}
            className="text-xs font-mono text-slate-400 hover:text-brand-cyan underline transition-colors cursor-pointer"
          >
            Continue as Guest without account &rarr;
          </button>
        </div>
      </Card>
    </div>
  );
};
