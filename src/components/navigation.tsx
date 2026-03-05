import React from 'react';
import { Home, Search, User, Compass, Radio } from 'lucide-react';
import Link from 'next/link';
import { UploadModal } from './upload-modal';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Navigation() {
  const pathname = usePathname();
  
  // Hide navigation on live page for immersive experience
  if (pathname === '/live') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-around px-4 z-50 pointer-events-auto">
      <Link href="/" className={cn("flex flex-col items-center justify-center p-2 transition-colors", pathname === '/' ? "text-primary" : "text-white/70 hover:text-white")}>
        <Home size={24} />
      </Link>
      <Link href="/live" className={cn("flex flex-col items-center justify-center p-2 transition-colors", pathname === '/live' ? "text-primary" : "text-white/70 hover:text-white")}>
        <Radio size={24} className={pathname === '/live' ? "animate-pulse" : ""} />
      </Link>
      
      <UploadModal />

      <Link href="/search" className={cn("flex flex-col items-center justify-center p-2 transition-colors", pathname === '/search' ? "text-primary" : "text-white/70 hover:text-white")}>
        <Search size={24} />
      </Link>
      <Link href="/profile" className={cn("flex flex-col items-center justify-center p-2 transition-colors", pathname === '/profile' ? "text-primary" : "text-white/70 hover:text-white")}>
        <User size={24} />
      </Link>
    </div>
  );
}
