"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  RefreshCw,
  Camera
} from 'lucide-react';

export default function LivePage() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [comments, setComments] = useState<{id: number, user: string, text: string}[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isAccessing, setIsAccessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const getCameraPermission = useCallback(async () => {
    setIsAccessing(true);
    try {
      // إيقاف أي بث سابق
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, 
        audio: true 
      });
      
      streamRef.current = stream;
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
        description: 'يرجى تفعيل صلاحيات الكاميرا والميكروفون من إعدادات المتصفح لبدء البث.',
      });
    } finally {
      setIsAccessing(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    getCameraPermission();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [getCameraPermission]);

  const startLive = () => {
    if (!hasCameraPermission) {
      toast({ title: "لا يمكن بدء البث", description: "يرجى منح صلاحية الكاميرا أولاً.", variant: "destructive" });
      return;
    }
    setIsLive(true);
    setViewers(Math.floor(Math.random() * 50) + 120);
    setComments([
      { id: 1, user: "AXI_Bot", text: "أهلاً بك في البث المباشر لـ AXI PRO MAX! 🚀" },
      { id: 2, user: "سارة", text: "منور يا بطل! المحتوى رائع 🔥" }
    ]);
    toast({ title: "أنت الآن على الهواء مباشرة! 🔴" });
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments(prev => [...prev, { id: Date.now(), user: user?.displayName?.split(' ')[0] || "أنا", text: newComment }]);
    setNewComment('');
  };

  if (isUserLoading) return (
    <div className="h-screen w-full flex items-center justify-center bg-black">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
    </div>
  );

  return (
    <main className="relative h-screen w-full bg-[#050505] overflow-hidden flex flex-col">
      {/* خلفية الفيديو المباشر */}
      <div className="absolute inset-0 z-0">
        <video 
          ref={videoRef} 
          className="w-full h-full object-cover mirror" 
          autoPlay 
          muted 
          playsInline 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
      </div>

      {/* شريط الأدوات العلوي */}
      <div className="relative z-10 p-5 flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="w-12 h-12 border-2 border-primary shadow-[0_0_15px_rgba(0,229,255,0.4)]">
              <AvatarImage src={`https://picsum.photos/seed/${user?.uid}/200/200`} />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            {isLive && (
              <div className="absolute -bottom-1 -right-1 bg-destructive text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase animate-pulse border border-white/20">
                Live
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <h4 className="text-white text-sm font-bold drop-shadow-lg tracking-tight">@{user?.displayName?.replace(/\s+/g, '_').toLowerCase() || 'axi_user'}</h4>
            <div className="flex items-center gap-1.5 text-primary text-[11px] font-black uppercase tracking-tighter">
              <Users size={12} className="animate-pulse" /> {viewers} VIEWERS
            </div>
          </div>
          {!isLive && hasCameraPermission && (
            <Button 
              size="sm" 
              className="bg-primary text-black font-black h-8 px-5 rounded-full ml-3 shadow-[0_0_25px_rgba(0,229,255,0.5)] hover:bg-primary/90 active:scale-95 transition-all text-xs"
              onClick={startLive}
            >
              GO LIVE
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          {!isLive && (
            <button 
              onClick={getCameraPermission}
              className="bg-white/10 backdrop-blur-xl p-2.5 rounded-full text-white hover:bg-white/20 transition-all border border-white/5"
              disabled={isAccessing}
            >
              <RefreshCw size={22} className={isAccessing ? "animate-spin" : ""} />
            </button>
          )}
          <button 
            onClick={() => router.push('/')}
            className="bg-white/10 backdrop-blur-xl p-2.5 rounded-full text-white hover:bg-white/20 transition-all border border-white/5"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* رسالة طلب الصلاحيات */}
      {hasCameraPermission === false && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/95 text-center">
          <div className="max-w-xs space-y-6">
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center bg-primary/10 rounded-full">
              <Camera className="h-10 w-10 text-primary animate-bounce" />
              <div className="absolute inset-0 border-2 border-primary border-dashed rounded-full animate-spin-slow" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-headline font-bold text-white">Camera Required</h2>
              <p className="text-white/60 text-sm leading-relaxed">
                AXI PRO MAX يحتاج للوصول للكاميرا لبدء تجربة البث السينمائي.
              </p>
            </div>
            <Button 
              className="w-full bg-primary text-black font-bold h-12 rounded-xl"
              onClick={getCameraPermission}
            >
              تفعيل الكاميرا الآن
            </Button>
          </div>
        </div>
      )}

      {/* منطقة التعليقات والتفاعل */}
      <div className="mt-auto relative z-10 p-5 space-y-5">
        <div className="h-56 overflow-y-auto flex flex-col gap-3 mask-fade-top pr-2 custom-scrollbar">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2.5 animate-in slide-in-from-left-2 duration-300">
              <Avatar className="w-6 h-6 border border-white/10">
                <AvatarImage src={`https://picsum.photos/seed/${c.user}/100/100`} />
                <AvatarFallback>{c.user[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-primary/90 font-black text-[10px] uppercase tracking-wider">{c.user}</span>
                <span className="text-white text-xs drop-shadow-md bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-2xl rounded-tl-none border border-white/5">
                  {c.text}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <form onSubmit={handleSendComment} className="flex-1 relative">
            <Input 
              placeholder="ارسل رسالة للمبدع..." 
              className="bg-white/10 backdrop-blur-2xl border-white/5 rounded-2xl h-14 pr-14 text-white placeholder:text-white/30 text-sm focus:ring-primary/40"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary p-2 rounded-xl text-black hover:scale-105 transition-transform active:scale-90">
              <Send size={20} />
            </button>
          </form>
          
          <div className="flex gap-2">
            <button className="bg-white/10 backdrop-blur-2xl p-4 rounded-2xl text-white active:scale-150 transition-all border border-white/5 group">
              <Heart size={24} className="group-hover:fill-destructive group-hover:text-destructive transition-colors" />
            </button>
            <button className="bg-white/10 backdrop-blur-2xl p-4 rounded-2xl text-white border border-white/5">
              <Share2 size={24} />
            </button>
          </div>
        </div>
      </div>

      {isLive && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-destructive/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.3em] flex items-center gap-2.5 shadow-[0_0_30px_rgba(255,0,0,0.4)] border border-white/20">
            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
            STREAMING LIVE
          </div>
        </div>
      )}

      <style jsx global>{`
        .mirror {
          transform: scaleX(-1);
        }
        .mask-fade-top {
          mask-image: linear-gradient(to top, black 85%, transparent 100%);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 229, 255, 0.2);
          border-radius: 10px;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </main>
  );
}
