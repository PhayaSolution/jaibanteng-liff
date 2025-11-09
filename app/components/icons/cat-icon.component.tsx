export default function CatIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Simple cat head icon - minimalist line art style */}
      <circle cx="50" cy="45" r="25" stroke="currentColor" strokeWidth="2" fill="none" />
      {/* Ears */}
      <path d="M35 25 L30 15 L40 20 Z" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M65 25 L70 15 L60 20 Z" stroke="currentColor" strokeWidth="2" fill="none" />
      {/* Eyes */}
      <circle cx="43" cy="42" r="3" fill="currentColor" />
      <circle cx="57" cy="42" r="3" fill="currentColor" />
      {/* Nose */}
      <path d="M50 48 L47 52 L53 52 Z" fill="currentColor" />
      {/* Mouth */}
      <path d="M47 52 Q50 55 53 52" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

