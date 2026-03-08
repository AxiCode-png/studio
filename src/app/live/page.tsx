"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { 
  X, 
  Users, 
  Heart, 
  Share2, 
  Send, 
  Loader2,
  RefreshCw,
  Camera,
  Sparkles,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const AI_FILTERS = [
  { id: 'none', name: 'Original', class: '' },
  { id: 'neon', name: 'AXI Neon', class: 'filter-neon' },
  { id: 'cyber', name: 'Cyberpunk', class: 'filter-cyber' },
  { id: 'night', name: 'Night Vision', class: 'filter-night' },
  { id: 'dream', name: 'Dreamy', class: 'filter-dream' },
];

export default function LivePage() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [activeFilter, setActiveFilter] = useState('none');
  const [viewers, setViewers] = useState(0);
  const [comments, setComments] = useState<{id: number, user: string, text: string}[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isAccessing, setIsAccessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile } = useDoc(userDocRef);

  const getCameraPermission = useCallback(async () => {
    setIsAccessing(true);
    try {
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
        description: 'يرجى تفعيل صلاحيات الكاميرا والميكروفون لبدء البث.',
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
    // فحص المستخدمين الحقيقيين (يجب أن يكون لديه اسم وسن مسجلين)
    if (!profile?.firstName || !profile?.age) {
      toast({ 
        title: "تحقق من الهوية مطلوب", 
        description: "يرجى إكمال بيانات ملفك الشخصي (الاسم والسن) لتتمكن من البث كمبدع حقيقي.", 
        variant: "destructive" 
      });
      return;
    }

    if (!hasCameraPermission) {
      toast({ title: "لا يمكن بدء البث", description: "يرجى منح صلاحية الكاميرا أولاً.", variant: "destructive" });
      return;
    }
    
    setIsLive(true);
    setViewers(Math.floor(Math.random() * 50) + 120);
    setComments([
      { id: 1, user: "AXI_System", text: "تم تفعيل حماية البث للمبدعين الحقيقيين ✅" },
      { id: 2, user: "AXI_Bot", text: "أهلاً بك في البث المباشر المطور لـ AXI PRO MAX! 🚀" }
    ]);
    toast({ title: "أنت الآن على الهواء مباشرة! 🔴" });
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments(prev => [...prev, { id: Date.now(), user: profile?.firstName || "أنا", text: newComment }]);
    setNewComment('');
  };

  if (isUserLoading) return (
    <div className="h-screen w-full flex items-center justify-center bg-black">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
    </div>
  );

  return (
    <main className="relative h-screen w-full bg-[#050505] overflow-hidden flex flex-col">
      {/* خلفية الفيديو مع الفلتر النشط */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video 
          ref={videoRef} 
          className={cn(
            "w-full h-full object-cover mirror transition-all duration-700",
            AI_FILTERS.find(f => f.id === activeFilter)?.class
          )} 
          autoPlay 
          muted 
          playsInline 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />
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
            <div className="flex items-center gap-1">
              <h4 className="text-white text-sm font-bold drop-shadow-lg tracking-tight">@{profile?.firstName || 'axi_user'}</h4>
              <ShieldCheck size={14} className="text-primary" />
            </div>
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

      {/* قائمة فلاتر AI */}
      <div className="relative z-20 px-5 flex gap-3 overflow-x-auto py-2 no-scrollbar">
        {AI_FILTERS.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={cn(
              "whitespace-nowrap px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border",
              activeFilter === filter.id 
                ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(0,229,255,0.4)]" 
                : "bg-black/40 text-white/60 border-white/10 backdrop-blur-md"
            )}
          >
            <div className="flex items-center gap-1.5">
              <Sparkles size={10} />
              {filter.name}
            </div>
          </button>
        ))}
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
              <h2 className="text-2xl font-headline font-bold text-white uppercase tracking-tighter italic">Camera Access</h2>
              <p className="text-white/60 text-sm leading-relaxed">
                AXI PRO MAX يتطلب صلاحية الكاميرا لتقديم تجربة بث سينمائية عالية الدقة.
              </p>
            </div>
            <Button 
              className="w-full bg-primary text-black font-bold h-12 rounded-xl shadow-[0_0_30px_rgba(0,229,255,0.3)]"
              onClick={getCameraPermission}
            >
              تفعيل الكاميرا والميكروفون
            </Button>
          </div>
        </div>
      )}

      {/* منطقة التعليقات والتفاعل */}
      <div className="mt-auto relative z-10 p-5 pb-8 space-y-5">
        <div className="h-48 overflow-y-auto flex flex-col gap-3 mask-fade-top pr-2 custom-scrollbar">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2.5 animate-in slide-in-from-left-2 duration-300">
              <Avatar className="w-6 h-6 border border-white/10">
                <AvatarImage src={`https://picsum.photos/seed/${c.user}/100/100`} />
                <AvatarFallback>{c.user[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-primary/90 font-black text-[9px] uppercase tracking-wider">{c.user}</span>
                <span className="text-white text-xs drop-shadow-md bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-2xl rounded-tl-none border border-white/5">
                  {c.text}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <form onSubmit={handleSendComment} className="flex-1 relative">
            <Input 
              placeholder="تفاعل مع المبدع الحقيقي..." 
              className="bg-white/10 backdrop-blur-3xl border-white/5 rounded-2xl h-14 pr-14 text-white placeholder:text-white/30 text-sm focus:ring-primary/40 transition-all"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary p-2 rounded-xl text-black hover:scale-105 transition-transform active:scale-90 shadow-lg">
              <Send size={20} />
            </button>
          </form>
          
          <div className="flex gap-2">
            <button className="bg-white/10 backdrop-blur-3xl p-4 rounded-2xl text-white active:scale-150 transition-all border border-white/5 group">
              <Heart size={24} className="group-hover:fill-destructive group-hover:text-destructive transition-colors" />
            </button>
            <button className="bg-white/10 backdrop-blur-3xl p-4 rounded-2xl text-white border border-white/5">
              <Share2 size={24} />
            </button>
          </div>
        </div>
      </div>

      {isLive && (
        <div className="fixed top-32 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-destructive/90 backdrop-blur-md text-white px-5 py-2 rounded-full text-[9px] font-black tracking-[0.4em] flex items-center gap-3 shadow-[0_0_40px_rgba(255,0,0,0.5)] border border-white/20">
            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
            LIVE • REAL CONTENT
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
        .no-scrollbar::-webkit-scrollbar {
          display: none;
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

        /* AI Filters */
        .filter-neon {
          filter: contrast(1.2) saturate(1.8) hue-rotate(15deg) brightness(1.1);
          box-shadow: inset 0 0 100px rgba(0, 229, 255, 0.2);
        }
        .filter-cyber {
          filter: sepia(0.3) saturate(2.5) contrast(1.3) brightness(0.9);
          mix-blend-mode: hard-light;
        }
        .filter-night {
          filter: grayscale(0.5) contrast(1.5) brightness(0.7) sepia(1) hue-rotate(90deg);
        }
        .filter-dream {
          filter: blur(0.5px) saturate(1.2) brightness(1.1) contrast(0.9);
        }
      `}</style>
    </main>
  );
}
