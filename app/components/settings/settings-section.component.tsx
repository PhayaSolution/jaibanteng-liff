interface SettingsSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export default function SettingsSection({
  title,
  description,
  children,
  className = '',
}: SettingsSectionProps) {
  return (
    <div className={`mb-6 ${className}`}>
      {(title || description) && (
        <div className="mb-2 px-1">
          {title && (
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}





