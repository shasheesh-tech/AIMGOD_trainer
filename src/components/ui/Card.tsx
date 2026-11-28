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
      className={`lab-panel relative rounded-lg bg-[#0a0b0e]/55 border transition-colors duration-150 backdrop-blur-[3px] flex flex-col ${
        glow
          ? 'border-[#8F9196]/65'
          : 'border-[#35383E]/75 hover:border-[#8F9196]/55'
      } ${className}`}
    >
      {(title || subtitle || badge || icon || headerAction) && (
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#35383E]/55">
          <div className="flex items-center gap-2.5">
            {icon && (
              <div className="w-8 h-8 rounded border border-[#8F9196]/40 bg-[#1F2023]/40 flex items-center justify-center text-[#BEC7D7] shrink-0">
                {icon}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                {title && (
                  <h3 className="font-display font-semibold text-xs tracking-wider text-[#E4E2E3] uppercase">
                    {title}
                  </h3>
                )}
                {badge}
              </div>
              {subtitle && (
                <p className="text-[11px] text-[#9FA4AE] mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}

      <div className="p-4 flex-1 flex flex-col">{children}</div>
    </div>
  );
};
