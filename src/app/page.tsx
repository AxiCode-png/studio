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

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth');
    }
  }, [user, isUserLoading, router]);

  const videosQuery = useMemoFirebase(() => {
    return query(collection(db, 'videos'), orderBy('uploadTimestamp', 'desc'), limit(50));
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
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0A0A0A] gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-primary blur-2xl opacity-20 animate-pulse"></div>
          <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
        </div>
        <p className="text-primary font-headline font-bold text-xl tracking-widest animate-pulse">AXI PRO MAX</p>
      </div>
    );
  }

  return (
    <main className="relative h-screen w-full bg-black overflow-hidden">
      <div className="fixed top-0 left-0 right-0 h-20 flex items-center justify-center z-50 pointer-events-none bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex gap-8 pointer-events-auto">
          <button className="text-white font-headline font-bold text-lg opacity-40 hover:opacity-100 transition-opacity">متابعة</button>
          <button className="text-white font-headline font-bold text-lg border-b-4 border-primary pb-1 shadow-[0_4px_10px_rgba(0,229,255,0.5)]">لك</button>
        </div>
      </div>

      <div className="video-container h-full">
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
                videoUrl={video.videoUrl}
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
          <div className="h-full w-full flex items-center justify-center p-8 text-center bg-[#0A0A0A]">
            <div className="space-y-4">
              <p className="text-3xl font-headline font-bold text-primary">كن الأول في العالم!</p>
              <p className="text-muted-foreground">انشر أول فيديو حصري على AXI PRO MAX الآن.</p>
            </div>
          </div>
        )}
      </div>

      <Navigation />
      <Toaster />
    </main>
  );
}