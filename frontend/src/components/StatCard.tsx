import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  subtitle?: string;
  variant?: 'default' | 'accent' | 'error' | 'primary';
  icon?: ReactNode;
  children?: ReactNode;
}

const variantStyles = {
  default: 'bg-surface-container-lowest',
  accent: 'bg-surface-container-lowest',
  error: 'bg-surface-container-lowest border-b-2 border-error/20',
  primary: 'bg-primary shadow-lg',
};

const textStyles = {
  default: 'text-tertiary',
  accent: 'text-accent',
  error: 'text-error',
  primary: 'text-white',
};

const labelStyles = {
  default: 'text-on-surface-variant',
  accent: 'text-on-surface-variant',
  error: 'text-on-surface-variant',
  primary: 'text-primary-fixed',
};

export default function StatCard({ label, value, subtitle, variant = 'default', children }: StatCardProps) {
  return (
    <div className={`p-6 rounded-xl relative overflow-hidden group ${variantStyles[variant]}`}>
      {variant === 'default' && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-500" />
      )}
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-br from-on-primary-container/20 to-transparent pointer-events-none" />
      )}
      <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${labelStyles[variant]}`}>
        {label}
      </p>
      <h3 className={`text-2xl font-extrabold ${textStyles[variant]}`}>
        {value}
      </h3>
      {subtitle && (
        <p className={`text-[10px] mt-4 font-medium ${variant === 'primary' ? 'text-white/80' : 'text-on-surface-variant'}`}>
          {subtitle}
        </p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
