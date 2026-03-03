"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { VideoPlayer } from '@/components/video-player';
import { EngagementBar } from '@/components/engagement-bar';
import { VideoInfo } from '@/components/video-info';
import { Navigation } from '@/components/navigation';
import { Toaster } from '@/components/ui/toaster';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(0);
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth');
    }
  }, [user, isUserLoading, router]);

  const videosQuery = useMemoFirebase(() => {
    return query(collection(db, 'videos'), orderBy('uploadTimestamp', 'desc'), limit(10));
  }, [db]);

  const { data: videos, isLoading: isVideosLoading } = useCollection(videosQuery);

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

  if (isUserLoading || isVideosLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground font-headline font-bold">Loading AXI Feed...</p>
      </div>
    );
  }

  return (
    <main className="relative h-screen w-full bg-background overflow-hidden">
      <div className="fixed top-0 left-0 right-0 h-16 flex items-center justify-center z-50 pointer-events-none">
        <div className="flex gap-6 pointer-events-auto">
          <button className="text-white font-headline font-bold text-lg opacity-60">Following</button>
          <button className="text-white font-headline font-bold text-lg border-b-2 border-primary pb-1">For You</button>
        </div>
      </div>

      <div className="video-container">
        {videos && videos.length > 0 ? (
          videos.map((video, index) => (
            <div key={video.id} className="video-slide relative">
              <VideoPlayer 
                src={video.videoUrl} 
                isActive={activeIndex === index} 
              />
              <div className="absolute inset-0 glass-overlay pointer-events-none" />
              
              <EngagementBar 
                videoId={video.id}
                likes={video.likesCount || 0} 
                comments={0} 
                shares={0}
                uploaderId={video.uploaderId}
              />
              
              <VideoInfo 
                username={video.uploaderId.substring(0, 8)} 
                title={video.title} 
                hashtags={video.hashtags || []} 
              />
            </div>
          ))
        ) : (
          <div className="h-full w-full flex items-center justify-center p-8 text-center">
            <div>
              <p className="text-xl font-bold mb-2">No videos yet!</p>
              <p className="text-muted-foreground">Be the first to upload one by clicking the + button.</p>
            </div>
          </div>
        )}
      </div>

      <Navigation />
      <Toaster />
    </main>
  );
}
