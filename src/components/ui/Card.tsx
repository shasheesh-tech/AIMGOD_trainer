import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  glow?: boolean;
  className?: string;
  headerAction?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  badge,
  icon,
  glow = false,
  className = '',
  headerAction,
}) => {
  return (
    <div
      className={`relative rounded-xl bg-dark-900/90 border transition-all duration-200 backdrop-blur-md overflow-hidden ${
        glow
          ? 'border-brand-cyan/40 shadow-glow-cyan-sm'
          : 'border-dark-750 hover:border-dark-600'
      } ${className}`}
    >
      {/* Subtle corner light accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-cyan/5 rounded-full blur-2xl pointer-events-none" />

      {(title || subtitle || badge || icon || headerAction) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-800/80 bg-dark-950/40">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-2 rounded-lg bg-dark-800 border border-dark-700 text-brand-cyan">
                {icon}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                {title && (
                  <h3 className="font-display font-bold text-sm tracking-wide text-slate-100 uppercase">
                    {title}
                  </h3>
                )}
                {badge}
              </div>
              {subtitle && (
                <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}

      <div className="p-5">{children}</div>
    </div>
  );
};
