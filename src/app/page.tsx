"use client";

import React, { useState, useEffect } from 'react';
import { VideoPlayer } from '@/components/video-player';
import { EngagementBar } from '@/components/engagement-bar';
import { VideoInfo } from '@/components/video-info';
import { Navigation } from '@/components/navigation';
import { Toaster } from '@/components/ui/toaster';

const MOCK_VIDEOS = [
  {
    id: '1',
    src: 'https://cdn.pixabay.com/vimeo/328941243/sunset-23136.mp4?width=1280&hash=1406e22c07338e3e4f624867e3a968600d3d5f30',
    username: 'alex_visuals',
    title: 'Cinematic sunset timelapse at the hidden cliffs. Nature is truly healing.',
    hashtags: ['sunset', 'cinematic', 'nature', 'vibes'],
    likes: '1.2M',
    comments: '4.5K',
    shares: '12K',
    avatar: 'https://picsum.photos/seed/alex/200/200'
  },
  {
    id: '2',
    src: 'https://cdn.pixabay.com/vimeo/457945535/cyberpunk-51475.mp4?width=1280&hash=66e8509b2e68406562507851e3096053f3e2e8e9',
    username: 'tech_aura',
    title: 'Neon city nights. Future is here.',
    hashtags: ['cyberpunk', 'neon', 'citylife', 'future'],
    likes: '890K',
    comments: '1.2K',
    shares: '5.6K',
    avatar: 'https://picsum.photos/seed/tech/200/200'
  },
  {
    id: '3',
    src: 'https://cdn.pixabay.com/vimeo/328941243/sunset-23136.mp4?width=1280&hash=1406e22c07338e3e4f624867e3a968600d3d5f30',
    username: 'travel_junkie',
    title: 'Exploring the unknown depths of the ocean floor.',
    hashtags: ['travel', 'ocean', 'adventure', 'blue'],
    likes: '2.5M',
    comments: '8.9K',
    shares: '45K',
    avatar: 'https://picsum.photos/seed/travel/200/200'
  }
];

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const container = document.querySelector('.video-container');
      if (container) {
        const index = Math.round(container.scrollTop / window.innerHeight);
        setActiveIndex(index);
      }
    };

    const container = document.querySelector('.video-container');
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="relative h-screen w-full bg-background overflow-hidden">
      {/* Top Header Placeholder */}
      <div className="fixed top-0 left-0 right-0 h-16 flex items-center justify-center z-50 pointer-events-none">
        <div className="flex gap-6 pointer-events-auto">
          <button className="text-white font-headline font-bold text-lg opacity-60">Following</button>
          <button className="text-white font-headline font-bold text-lg border-b-2 border-primary pb-1">For You</button>
        </div>
      </div>

      <div className="video-container">
        {MOCK_VIDEOS.map((video, index) => (
          <div key={video.id} className="video-slide relative">
            <VideoPlayer 
              src={video.src} 
              isActive={activeIndex === index} 
            />
            <div className="absolute inset-0 glass-overlay pointer-events-none" />
            
            <EngagementBar 
              likes={video.likes} 
              comments={video.comments} 
              shares={video.shares}
              userAvatar={video.avatar}
            />
            
            <VideoInfo 
              username={video.username} 
              title={video.title} 
              hashtags={video.hashtags} 
            />
          </div>
        ))}
      </div>

      <Navigation />
      <Toaster />
    </main>
  );
}