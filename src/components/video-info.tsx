import React from 'react';

interface VideoInfoProps {
  username: string;
  title: string;
  hashtags: string[];
}

export function VideoInfo({ username, title, hashtags }: VideoInfoProps) {
  return (
    <div className="absolute bottom-8 left-4 right-16 z-20 pointer-events-none">
      <h3 className="text-white font-bold text-lg mb-1 font-headline">@{username}</h3>
      <p className="text-white text-sm line-clamp-2 mb-2 leading-relaxed">{title}</p>
      <div className="flex flex-wrap gap-2">
        {hashtags.map((tag) => (
          <span key={tag} className="text-primary font-bold text-sm">
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}