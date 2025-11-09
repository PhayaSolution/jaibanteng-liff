export default function OilIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2v20M8 6h8M8 10h8M8 14h8M8 18h8" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

