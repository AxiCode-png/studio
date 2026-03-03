import React from 'react';
import { Home, Search, User, Compass } from 'lucide-react';
import Link from 'next/link';
import { UploadModal } from './upload-modal';

export function Navigation() {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-around px-4 z-50 pointer-events-auto">
      <Link href="/" className="flex flex-col items-center justify-center p-2 text-white">
        <Home size={24} />
      </Link>
      <Link href="/discover" className="flex flex-col items-center justify-center p-2 text-white/70 hover:text-white transition-colors">
        <Compass size={24} />
      </Link>
      
      <UploadModal />

      <Link href="/search" className="flex flex-col items-center justify-center p-2 text-white/70 hover:text-white transition-colors">
        <Search size={24} />
      </Link>
      <Link href="/profile" className="flex flex-col items-center justify-center p-2 text-white/70 hover:text-white transition-colors">
        <User size={24} />
      </Link>
    </div>
  );
}