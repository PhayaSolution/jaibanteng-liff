export default function ChartIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="9" x2="9" y2="21" />
      <line x1="15" y1="9" x2="15" y2="21" />
    </svg>
  );
}

