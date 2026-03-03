"use client";

import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc, increment } from 'firebase/firestore';
import { cn } from '@/lib/utils';

interface EngagementBarProps {
  videoId: string;
  likes: number;
  comments: number;
  shares: number;
  uploaderId: string;
}

export function EngagementBar({ videoId, likes, comments, shares, uploaderId }: EngagementBarProps) {
  const [isLiked, setIsLiked] = useState(false);
  const db = useFirestore();

  const userDocRef = useMemoFirebase(() => doc(db, 'users', uploaderId), [db, uploaderId]);
  const { data: userData } = useDoc(userDocRef);

  const handleLike = () => {
    setIsLiked(!isLiked);
    const videoRef = doc(db, 'videos', videoId);
    
    updateDocumentNonBlocking(videoRef, {
      likesCount: increment(isLiked ? -1 : 1)
    });
  };

  return (
    <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6 z-20">
      <div className="relative group">
        <Avatar className="w-12 h-12 border-2 border-white ring-2 ring-primary">
          <AvatarImage src={`https://picsum.photos/seed/${uploaderId}/200/200`} />
          <AvatarFallback>{userData?.firstName?.[0] || 'A'}</AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-accent rounded-full w-5 h-5 flex items-center justify-center text-white text-[10px] font-bold">
          +
        </div>
      </div>

      <button onClick={handleLike} className="flex flex-col items-center group">
        <div className="p-2 rounded-full transition-colors group-active:scale-125 duration-100">
          <Heart 
            size={32} 
            className={cn(
              "text-white transition-colors",
              isLiked ? "fill-red-500 text-red-500" : "fill-none"
            )} 
          />
        </div>
        <span className="text-white text-xs font-semibold drop-shadow-md">
          {likes > 999999 ? (likes / 1000000).toFixed(1) + 'M' : likes > 999 ? (likes / 1000).toFixed(1) + 'K' : likes}
        </span>
      </button>

      <button className="flex flex-col items-center group">
        <div className="p-2 rounded-full transition-colors">
          <MessageCircle size={32} className="text-white" />
        </div>
        <span className="text-white text-xs font-semibold drop-shadow-md">{comments}</span>
      </button>

      <button className="flex flex-col items-center group">
        <div className="p-2 rounded-full transition-colors">
          <Share2 size={32} className="text-white" />
        </div>
        <span className="text-white text-xs font-semibold drop-shadow-md">{shares}</span>
      </button>

      <button className="flex flex-col items-center group">
        <div className="p-2 rounded-full transition-colors">
          <MoreHorizontal size={32} className="text-white" />
        </div>
      </button>
    </div>
  );
}
