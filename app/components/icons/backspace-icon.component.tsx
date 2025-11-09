export default function BackspaceIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Rounded rectangle arrow pointing left */}
      <path d="M20 5H9l-6 7 6 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z" strokeLinejoin="round" />
      {/* X symbol inside the arrow head */}
      <line x1="11" y1="10" x2="15" y2="14" strokeWidth="2.5" />
      <line x1="11" y1="14" x2="15" y2="10" strokeWidth="2.5" />
    </svg>
  );
}

