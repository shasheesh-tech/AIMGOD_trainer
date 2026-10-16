import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'amber' | 'emerald' | 'rose' | 'neutral';
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'cyan',
  size = 'sm',
  pulse = false,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 tracking-wider',
    md: 'text-xs px-2.5 py-1 tracking-widest',
  };

  const variantStyles = {
    cyan: 'bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/30',
    amber: 'bg-brand-amber/10 text-brand-amber border border-brand-amber/30',
    emerald: 'bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/30',
    rose: 'bg-brand-rose/10 text-brand-rose border border-brand-rose/30',
    neutral: 'bg-dark-750 text-slate-300 border border-dark-600',
  };

  const dotStyles = {
    cyan: 'bg-brand-cyan',
    amber: 'bg-brand-amber',
    emerald: 'bg-brand-emerald',
    rose: 'bg-brand-rose',
    neutral: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono uppercase font-semibold rounded-full border backdrop-blur-sm ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotStyles[variant]}`} />
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotStyles[variant]}`} />
        </span>
      )}
      {children}
    </span>
  );
};
