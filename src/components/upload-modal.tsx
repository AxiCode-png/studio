"use client";

import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Sparkles, Loader2, Upload, Video, FileVideo, CheckCircle2, AlertCircle } from 'lucide-react';
import { generateCaptionAndHashtags } from '@/ai/flows/ai-caption-and-hashtag-generator';
import { generateAIVideo } from '@/ai/flows/ai-video-generator';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';

export function UploadModal() {
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [isLocalFile, setIsLocalFile] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const handleGenerateAI = async () => {
    if (!description.trim()) {
      toast({ title: "الرجاء إدخال وصف للفيديو أولاً.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateCaptionAndHashtags({ videoDescription: description });
      setTitle(result.title);
      setHashtags(result.hashtags);
      toast({ title: "تم توليد البيانات الذكية! ✨" });
    } catch (error) {
      toast({ title: "فشل توليد البيانات.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!description.trim()) {
      toast({ title: "اكتب وصفاً لتوليد فيديو AXI-AI.", variant: "destructive" });
      return;
    }
    setIsGeneratingVideo(true);
    try {
      toast({ title: "جاري توليد فيديو AXI-AI سينمائي... قد يستغرق دقيقة." });
      const result = await generateAIVideo({ prompt: description });
      setVideoUrl(result.videoDataUri);
      setIsLocalFile(false);
      toast({ title: "تم توليد الفيديو بنجاح! 🎬" });
    } catch (error: any) {
      toast({ 
        title: "فشل الذكاء الاصطناعي", 
        description: error.message || "تأكد من إعداد API Key بشكل صحيح.", 
        variant: "destructive" 
      });
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // زيادة المساحة المسموح بها إلى 950KB (أقصى حد لـ Firestore)
      const MAX_SIZE = 0.95 * 1024 * 1024;
      if (file.size > MAX_SIZE) { 
        toast({ 
          title: "حجم الفيديو كبير", 
          description: "الحد الأقصى هو 950 كيلوبايت. للفيديوهات الأكبر يرجى استخدام مولد الذكاء الاصطناعي.", 
          variant: "destructive" 
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoUrl(reader.result as string);
        setIsLocalFile(true);
        toast({ title: "تم اختيار الفيديو بنجاح! ✅" });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    if (!user) {
      toast({ title: "يرجى تسجيل الدخول أولاً.", variant: "destructive" });
      return;
    }
    if (!title || !videoUrl) {
      toast({ title: "العنوان والفيديو مطلوبان.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    const videosRef = collection(db, 'videos');
    
    addDocumentNonBlocking(videosRef, {
      title,
      description,
      hashtags,
      videoUrl: videoUrl,
      uploaderId: user.uid,
      likesCount: 0,
      uploadTimestamp: serverTimestamp()
    }).then(() => {
      setIsUploading(false);
      setOpen(false);
      resetForm();
      toast({ title: "تم النشر بنجاح على AXI! 🚀" });
    }).catch((err) => {
      setIsUploading(false);
      toast({ title: "فشل النشر", description: "قد يكون الحجم كبيراً جداً على السيرفر الحالي.", variant: "destructive" });
    });
  };

  const resetForm = () => {
    setDescription('');
    setTitle('');
    setHashtags([]);
    setVideoUrl('');
    setIsLocalFile(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex flex-col items-center justify-center p-2 text-white">
          <div className="relative scale-110">
            <div className="absolute inset-0 bg-primary blur-lg opacity-40 rounded-full"></div>
            <PlusCircle size={44} className="relative z-10 text-primary fill-background" />
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-background border-primary/20 text-foreground overflow-y-auto max-h-[95vh] backdrop-blur-2xl p-6 rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="font-headline text-3xl text-primary text-center neon-text tracking-tighter italic mb-2">AXI PUBLISH</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-2">
          <div className="grid grid-cols-2 gap-4 h-32">
            <button 
              onClick={handleGenerateVideo}
              disabled={isGeneratingVideo}
              className="border-2 border-dashed border-primary/30 rounded-2xl flex flex-col items-center justify-center gap-2 bg-primary/5 hover:bg-primary/10 transition-all active:scale-95"
            >
              {isGeneratingVideo ? (
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              ) : (
                <Sparkles className="w-8 h-8 text-primary" />
              )}
              <div className="text-center">
                <p className="text-[10px] font-bold text-primary uppercase">AXI-AI Video</p>
                <p className="text-[8px] text-white/40">Powered by Veo 2.0</p>
              </div>
            </button>

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-accent/30 rounded-2xl flex flex-col items-center justify-center gap-2 bg-accent/5 hover:bg-accent/10 transition-all active:scale-95"
            >
              <Upload className="w-8 h-8 text-accent" />
              <div className="text-center">
                <p className="text-[10px] font-bold text-accent uppercase">Upload File</p>
                <p className="text-[8px] text-white/40">Up to 950KB</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="video/*" 
                onChange={handleFileSelect}
              />
            </button>
          </div>

          {videoUrl && (
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-primary/20 shadow-2xl">
              <video src={videoUrl} className="w-full h-full object-contain" controls />
              <div className="absolute top-2 right-2 bg-primary/90 text-black text-[9px] px-2 py-0.5 rounded-full font-bold shadow-lg flex items-center gap-1">
                <CheckCircle2 size={10} />
                READY
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.2em] ml-1">Video Story</label>
              <div className="relative">
                <Textarea 
                  placeholder="صف فكرة الفيديو هنا..." 
                  className="bg-white/5 border-none resize-none pr-10 text-white h-20 rounded-xl focus:ring-1 focus:ring-primary/30"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="absolute bottom-2 right-2 text-primary hover:bg-primary/20"
                  onClick={handleGenerateAI}
                  disabled={isGenerating}
                >
                  {isGenerating ? <Loader2 className="animate-spin size-4" /> : <Sparkles size={18} />}
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.2em] ml-1">Catchy Title</label>
              <Input 
                placeholder="عنوان الفيديو..." 
                className="bg-white/5 border-none text-white h-11 rounded-xl focus:ring-1 focus:ring-primary/30" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <Button 
            className="w-full bg-primary text-black font-bold h-14 rounded-2xl text-lg hover:bg-primary/90 shadow-[0_10px_30px_rgba(0,229,255,0.2)]"
            disabled={isUploading || isGeneratingVideo || !videoUrl}
            onClick={handleUpload}
          >
            {isUploading ? <Loader2 className="animate-spin mr-2" /> : "نشر الآن"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}