import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-6 py-3 rounded uppercase text-xs tracking-widest font-bold transition-all transform active:scale-95 flex items-center justify-center gap-2";
  const variantStyles = variant === 'primary' 
    ? "bg-cyan-600 text-slate-950 hover:bg-cyan-400" 
    : "bg-transparent text-cyan-500 border border-cyan-900 hover:border-cyan-500";

  return (
    <button 
      className={`${baseStyles} ${variantStyles} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
