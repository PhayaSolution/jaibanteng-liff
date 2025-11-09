import Image from 'next/image';

export default function LoadingSVG() {
  return (
    <div className="w-full max-w-full px-4 sm:px-6 md:px-8">
      <div className="relative w-full aspect-square max-w-[280px] sm:max-w-[320px] md:max-w-[400px] mx-auto">
        <Image 
          src="/loading.svg" 
          alt="Loading" 
          fill
          className="object-contain"
          priority
          sizes="(max-width: 640px) 280px, (max-width: 768px) 320px, 400px"
        />
      </div>
    </div>
  );
}