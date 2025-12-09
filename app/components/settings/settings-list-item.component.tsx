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
    w-full flex items-center justify-between p-4 rounded-lg 
    bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 
    hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
    ${className}
  `;

  const content = (
    <>
      <div className="flex items-center gap-3">
        {icon && (
          <div className={`
            ${variant === 'danger' ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}
          `}>
            {icon}
          </div>
        )}
        <div className="flex flex-col items-start">
          <span className={`
            text-sm font-medium
            ${variant === 'danger' ? 'text-red-600 dark:text-red-400' : 'text-black dark:text-white'}
          `}>
            {title}
          </span>
          {description && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {description}
            </span>
          )}
        </div>
      </div>
      
      {rightElement ? (
        rightElement
      ) : (href || onClick) ? (
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
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



