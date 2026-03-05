"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  X, 
  Users, 
  MessageCircle, 
  Heart, 
  Share2, 
  Send, 
  Radio, 
  Loader2,
  Camera
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LivePage() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [comments, setComments] = useState<{id: number, user: string, text: string}[]>([]);
  const [newComment, setNewComment] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'فشل الوصول للكاميرا',
          description: 'يرجى تفعيل صلاحيات الكاميرا من إعدادات المتصفح لبدء البث.',
        });
      }
    };

    getCameraPermission();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  const startLive = () => {
    setIsLive(true);
    setViewers(Math.floor(Math.random() * 50) + 10);
    setComments([
      { id: 1, user: "أحمد", text: "واو! البث رائع 🔥" },
      { id: 2, user: "سارة", text: "منور يا بطل AXI" }
    ]);
    toast({ title: "أنت الآن على الهواء مباشرة! 🔴" });
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments(prev => [...prev, { id: Date.now(), user: user?.displayName?.split(' ')[0] || "أنا", text: newComment }]);
    setNewComment('');
  };

  if (isUserLoading) return null;

  return (
    <main className="relative h-screen w-full bg-black overflow-hidden flex flex-col">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video 
          ref={videoRef} 
          className="w-full h-full object-cover" 
          autoPlay 
          muted 
          playsInline 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
      </div>

      {/* Header Info */}
      <div className="relative z-10 p-4 flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="w-10 h-10 border-2 border-primary">
              <AvatarImage src={`https://picsum.photos/seed/${user?.uid}/200/200`} />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            {isLive && (
              <div className="absolute -bottom-1 -right-1 bg-destructive text-[8px] font-bold px-1 rounded uppercase animate-pulse">
                Live
              </div>
            )}
          </div>
          <div>
            <h4 className="text-white text-sm font-bold drop-shadow-md">@{user?.displayName?.replace(' ', '_').toLowerCase()}</h4>
            <div className="flex items-center gap-1 text-primary text-[10px] font-bold">
              <Users size={12} /> {viewers} مشاهد
            </div>
          </div>
          {!isLive && (
            <Button 
              size="sm" 
              className="bg-primary text-black font-bold h-7 px-4 rounded-full ml-2 shadow-[0_0_15px_rgba(0,229,255,0.4)]"
              onClick={startLive}
            >
              بدء البث
            </Button>
          )}
        </div>
        <button 
          onClick={() => router.push('/')}
          className="bg-white/10 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/20 transition-all"
        >
          <X size={24} />
        </button>
      </div>

      {/* Permissions Check */}
      {hasCameraPermission === false && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/90 text-center">
          <Alert variant="destructive" className="max-w-xs border-primary/50 bg-black/50 backdrop-blur-xl">
            <Radio className="h-6 w-6 text-primary animate-pulse mb-2 mx-auto" />
            <AlertTitle className="text-primary font-headline text-lg">مطلوب إذن الكاميرا</AlertTitle>
            <AlertDescription className="text-white/70">
              يرجى السماح بالوصول للكاميرا والميكروفون في متصفحك لتتمكن من بدء البث المباشر على AXI PRO MAX.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Comments Area (Bottom) */}
      <div className="mt-auto relative z-10 p-4 space-y-4">
        <div className="h-48 overflow-y-auto scrollbar-hide flex flex-col gap-2 mask-linear-top">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2 animate-in slide-in-from-left duration-300">
              <span className="text-primary/80 font-bold text-xs shrink-0">{c.user}:</span>
              <span className="text-white text-xs drop-shadow-md bg-black/20 px-2 py-1 rounded-lg">{c.text}</span>
            </div>
          ))}
        </div>

        {/* Input & Actions */}
        <div className="flex items-center gap-3">
          <form onSubmit={handleSendComment} className="flex-1 relative">
            <Input 
              placeholder="قل شيئاً..." 
              className="bg-white/10 border-none rounded-full h-11 pr-12 text-white placeholder:text-white/40 focus-visible:ring-1 focus-visible:ring-primary"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-primary">
              <Send size={20} />
            </button>
          </form>
          
          <div className="flex gap-2">
            <button className="bg-white/10 p-3 rounded-full text-white active:scale-125 transition-transform">
              <Heart size={24} className="fill-none hover:fill-destructive hover:text-destructive" />
            </button>
            <button className="bg-white/10 p-3 rounded-full text-white">
              <Share2 size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Live Badge Effect */}
      {isLive && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-destructive/90 text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(255,0,0,0.4)]">
            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
            ON AIR
          </div>
        </div>
      )}
    </main>
  );
}
