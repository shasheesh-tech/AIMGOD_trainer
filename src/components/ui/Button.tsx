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
  const baseStyles = 'inline-flex items-center justify-center font-display tracking-wider uppercase font-semibold transition-all duration-200 select-none relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 rounded-md gap-1.5',
    md: 'text-sm px-5 py-2.5 rounded-lg gap-2',
    lg: 'text-base px-7 py-3.5 rounded-lg gap-2.5 font-bold',
  };

  const variantStyles = {
    primary: 'bg-brand-cyan text-dark-950 hover:bg-[#38f4ff] hover:shadow-glow-cyan shadow-glow-cyan-sm border border-brand-cyan/60 active:brightness-95',
    secondary: 'bg-dark-800 text-slate-100 hover:bg-dark-750 hover:text-brand-cyan border border-dark-700 hover:border-brand-cyan/40',
    outline: 'bg-transparent text-brand-cyan border border-brand-cyan/60 hover:bg-brand-cyan/10 hover:shadow-glow-cyan-sm',
    danger: 'bg-brand-rose text-white hover:bg-[#ff527d] hover:shadow-glow-rose border border-brand-rose/60',
    ghost: 'bg-transparent text-slate-400 hover:text-slate-100 hover:bg-dark-800/60',
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
