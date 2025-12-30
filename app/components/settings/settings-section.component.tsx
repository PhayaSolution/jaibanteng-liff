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
    <div className={`mb-8 ${className}`}>
      {(title || description) && (
        <div className="mb-3 px-2">
          {title && (
            <h3 className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em] font-prompt">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-xs text-foreground/40 font-medium mt-0.5 font-prompt">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}










