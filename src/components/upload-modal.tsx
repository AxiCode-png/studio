"use client";

import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Sparkles, Loader2, Upload, Video, FileVideo, CheckCircle2 } from 'lucide-react';
import { generateCaptionAndHashtags } from '@/ai/flows/ai-caption-and-hashtag-generator';
import { generateAIVideo } from '@/ai/flows/ai-video-generator';
import { toast } from '@/hooks/use-toast';
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
      toast({ title: "جاري توليد فيديو Veo 3 سينمائي... انتظر قليلاً." });
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
      if (file.size > 20 * 1024 * 1024) { // 20MB limit for demo Base64
        toast({ title: "حجم الفيديو كبير", description: "الحد الأقصى في النسخة التجريبية هو 20 ميجابايت.", variant: "destructive" });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoUrl(reader.result as string);
        setIsLocalFile(true);
        toast({ title: "تم اختيار الفيديو من هاتفك! ✅" });
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
      toast({ title: "تم النشر بنجاح على AXI PRO MAX! 🚀" });
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
      <DialogContent className="sm:max-w-md bg-background border-primary/20 text-foreground overflow-y-auto max-h-[90vh] backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary text-center neon-text tracking-tighter italic">AXI PUBLISH</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleGenerateVideo}
              disabled={isGeneratingVideo}
              className="border-2 border-dashed border-primary/30 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 bg-primary/5 hover:bg-primary/10 transition-all active:scale-95 group"
            >
              {isGeneratingVideo ? (
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              ) : (
                <Sparkles className="w-10 h-10 text-primary group-hover:animate-pulse" />
              )}
              <div className="text-center">
                <p className="text-[10px] font-bold text-primary uppercase tracking-tighter">AI Generation</p>
                <p className="text-[8px] text-white/40">Veo 3.0 Model</p>
              </div>
            </button>

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-accent/30 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 bg-accent/5 hover:bg-accent/10 transition-all active:scale-95 group"
            >
              <Upload className="w-10 h-10 text-accent group-hover:-translate-y-1 transition-transform" />
              <div className="text-center">
                <p className="text-[10px] font-bold text-accent uppercase tracking-tighter">Phone Upload</p>
                <p className="text-[8px] text-white/40">From Gallery</p>
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
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-primary/20 shadow-2xl group">
              <video src={videoUrl} className="w-full h-full object-contain" controls />
              <div className="absolute top-3 right-3 bg-primary/90 text-black text-[10px] px-3 py-1 rounded-full font-bold shadow-lg flex items-center gap-1">
                <CheckCircle2 size={12} />
                {isLocalFile ? 'GALLERY READY' : 'AI GENERATED'}
              </div>
            </div>
          )}

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.2em] ml-1">Video Description</label>
              <div className="relative">
                <Textarea 
                  placeholder="صف الفيديو هنا لتحصل على عنوان وهاشتاقات ذكية..." 
                  className="bg-white/5 border-none resize-none pr-12 text-white h-24 rounded-xl focus:ring-1 focus:ring-primary/30 transition-all"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="absolute bottom-3 right-3 text-primary hover:bg-primary/20 rounded-lg"
                  onClick={handleGenerateAI}
                  disabled={isGenerating}
                >
                  {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.2em] ml-1">Engaging Title</label>
              <Input 
                placeholder="عنوان الفيديو المثير..." 
                className="bg-white/5 border-none text-white h-12 rounded-xl focus:ring-1 focus:ring-primary/30 transition-all" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {hashtags.map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <Button 
            className="w-full bg-primary text-black font-bold h-14 rounded-2xl text-lg hover:bg-primary/90 shadow-[0_10px_30px_rgba(0,229,255,0.2)] transition-all active:scale-[0.98]"
            disabled={isUploading || isGeneratingVideo || !videoUrl}
            onClick={handleUpload}
          >
            {isUploading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin" />
                جاري النشر...
              </div>
            ) : "انشر الآن على AXI"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
