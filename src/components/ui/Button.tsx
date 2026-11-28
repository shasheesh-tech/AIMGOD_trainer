import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-display tracking-wider uppercase font-semibold transition-all duration-150 select-none relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#BEC7D7]/50 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 rounded gap-1.5',
    md: 'text-xs px-5 py-2.5 rounded gap-2',
    lg: 'text-sm px-7 py-3 rounded gap-2.5 font-bold',
  };

  const variantStyles = {
    primary:
      'bg-[#BEC7D7] text-[#181C22] hover:bg-[#E4E2E3] border border-[#E4E2E3]/40 shadow-lg shadow-black/50 active:brightness-95',
    secondary:
      'bg-[#1F2023]/55 text-[#E4E2E3] hover:bg-[#2A2B2F]/75 border border-[#8F9196]/50 hover:border-[#BEC7D7]/70',
    outline:
      'bg-transparent text-[#BEC7D7] border border-[#8F9196]/60 hover:bg-[#2A2B2F]/45 hover:text-[#E4E2E3] hover:border-[#BEC7D7]',
    danger:
      'bg-brand-rose/90 text-white hover:bg-brand-rose border border-brand-rose/60',
    ghost:
      'bg-transparent text-[#9FA4AE] hover:text-[#E4E2E3] hover:bg-[#1F2023]/45',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </button>
  );
};
