'use client';

import Link from 'next/link';

interface SettingsListItemProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  rightElement?: React.ReactNode;
  variant?: 'default' | 'danger';
  className?: string;
}

export default function SettingsListItem({
  title,
  description,
  icon,
  href,
  onClick,
  rightElement,
  variant = 'default',
  className = '',
}: SettingsListItemProps) {
  const baseClasses = `
    w-full flex items-center justify-between p-4 rounded-[1.5rem] 
    glass shadow-xl shadow-black/5 hover:scale-[1.02] transition-all duration-300
    ${className}
  `;

  const content = (
    <>
      <div className="flex items-center gap-4">
        {icon && (
          <div className={`
            p-2.5 rounded-2xl bg-foreground/5
            ${variant === 'danger' ? 'text-destructive' : 'text-primary'}
          `}>
            {icon}
          </div>
        )}
        <div className="flex flex-col items-start min-w-0">
          <span className={`
            text-sm font-bold font-prompt
            ${variant === 'danger' ? 'text-destructive' : 'text-foreground'}
          `}>
            {title}
          </span>
          {description && (
            <span className="text-xs text-foreground/40 font-medium truncate font-prompt">
              {description}
            </span>
          )}
        </div>
      </div>
      
      {rightElement ? (
        rightElement
      ) : (href || onClick) ? (
        <svg
          className={`w-5 h-5 ${variant === 'danger' ? 'text-destructive/50' : 'text-foreground/20'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M9 5l7 7-7 7"
          />
        </svg>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className={baseClasses}>
        {content}
      </button>
    );
  }

  return <div className={baseClasses}>{content}</div>;
}










