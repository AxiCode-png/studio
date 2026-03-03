"use client";

import React from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface EngagementBarProps {
  likes: string | number;
  comments: string | number;
  shares: string | number;
  userAvatar?: string;
}

export function EngagementBar({ likes, comments, shares, userAvatar }: EngagementBarProps) {
  return (
    <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6 z-20">
      <div className="relative group">
        <Avatar className="w-12 h-12 border-2 border-white ring-2 ring-primary">
          <AvatarImage src={userAvatar || "https://picsum.photos/seed/avatar/200/200"} />
          <AvatarFallback>AX</AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-accent rounded-full w-5 h-5 flex items-center justify-center text-white text-[10px] font-bold">
          +
        </div>
      </div>

      <button className="flex flex-col items-center group">
        <div className="p-2 rounded-full transition-colors group-active:scale-125 duration-100">
          <Heart size={32} className="text-white fill-none group-active:fill-red-500 group-active:text-red-500" />
        </div>
        <span className="text-white text-xs font-semibold drop-shadow-md">{likes}</span>
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