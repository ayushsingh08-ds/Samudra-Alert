import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'glass';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'glass', className = '' }) => {
  const variants = {
    primary: 'bg-nivara-accent-primary/20 text-nivara-accent-primary border-nivara-accent-primary/30',
    success: 'bg-nivara-success/20 text-nivara-success border-nivara-success/30',
    warning: 'bg-nivara-warning/20 text-nivara-warning border-nivara-warning/30',
    danger: 'bg-nivara-danger/20 text-nivara-danger border-nivara-danger/30',
    info: 'bg-nivara-info/20 text-nivara-info border-nivara-info/30',
    glass: 'bg-nivara-bg-glass text-nivara-text-secondary border-nivara-border',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
