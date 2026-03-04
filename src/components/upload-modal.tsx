"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Sparkles, Loader2, Upload, Video } from 'lucide-react';
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
      toast({ title: "تم توليد العنوان والهاشتاقات بنجاح!" });
    } catch (error) {
      toast({ title: "فشل توليد البيانات الذكية.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!description.trim()) {
      toast({ title: "الرجاء كتابة وصف لتوليد الفيديو.", variant: "destructive" });
      return;
    }
    setIsGeneratingVideo(true);
    try {
      toast({ title: "بدأ توليد فيديو AXI-AI... قد يستغرق دقيقة." });
      const result = await generateAIVideo({ prompt: description });
      setVideoUrl(result.videoDataUri);
      toast({ title: "تم توليد الفيديو بنجاح! 🎬" });
    } catch (error) {
      toast({ title: "فشل توليد الفيديو بالذكاء الاصطناعي.", variant: "destructive" });
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleUpload = () => {
    if (!user) {
      toast({ title: "يرجى تسجيل الدخول للنشر.", variant: "destructive" });
      return;
    }
    if (!title || !description) {
      toast({ title: "العنوان والوصف مطلوبان.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    
    // Use generated video or a default placeholder if none
    const finalVideoUrl = videoUrl || "https://cdn.pixabay.com/vimeo/328941243/sunset-23136.mp4?width=1280&hash=1406e22c07338e3e4f624867e3a968600d3d5f30";

    const videosRef = collection(db, 'videos');
    
    addDocumentNonBlocking(videosRef, {
      title,
      description,
      hashtags,
      videoUrl: finalVideoUrl,
      uploaderId: user.uid,
      likesCount: 0,
      uploadTimestamp: serverTimestamp()
    }).then(() => {
      setIsUploading(false);
      setOpen(false);
      setDescription('');
      setTitle('');
      setHashtags([]);
      setVideoUrl('');
      toast({ title: "تم النشر بنجاح على AXI PRO MAX!" });
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex flex-col items-center justify-center p-2 text-white">
          <div className="relative">
            <div className="absolute inset-0 bg-primary blur-md opacity-50 rounded-full"></div>
            <PlusCircle size={40} className="relative z-10 text-primary fill-background" />
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-background border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary">رفع فيديو جديد</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          <div 
            onClick={handleGenerateVideo}
            className="border-2 border-dashed border-muted rounded-xl p-8 flex flex-col items-center justify-center gap-3 bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer"
          >
            {isGeneratingVideo ? (
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            ) : videoUrl ? (
              <Video className="w-10 h-10 text-accent" />
            ) : (
              <Sparkles className="w-10 h-10 text-primary" />
            )}
            <p className="text-sm text-muted-foreground font-medium">
              {isGeneratingVideo ? "جاري توليد الفيديو..." : videoUrl ? "تم تجهيز الفيديو بالذكاء الاصطناعي" : "توليد فيديو بالذكاء الاصطناعي (أو اختر ملف)"}
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">عن ماذا يتحدث الفيديو؟</label>
              <div className="relative">
                <Textarea 
                  placeholder="مثال: غروب شمس هادئ على شاطئ البحر..." 
                  className="bg-muted/50 border-none resize-none pr-12 text-white"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="absolute bottom-2 right-2 text-accent"
                  onClick={handleGenerateAI}
                  disabled={isGenerating}
                >
                  {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
                </Button>
              </div>
              <p className="text-[10px] text-accent flex items-center gap-1">
                <Sparkles size={10} /> مدعوم بـ AXI-AI
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">العنوان</label>
              <Input 
                placeholder="عنوان الفيديو" 
                className="bg-muted/50 border-none text-white" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">الهاشتاقات</label>
              <div className="flex flex-wrap gap-2">
                {hashtags.length > 0 ? (
                  hashtags.map(tag => (
                    <span key={tag} className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                      #{tag}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic">لم يتم توليد هاشتاقات بعد</p>
                )}
              </div>
            </div>
          </div>

          <Button 
            className="w-full bg-primary text-background font-bold h-12 text-lg hover:bg-primary/90"
            disabled={isUploading || isGeneratingVideo}
            onClick={handleUpload}
          >
            {isUploading ? <Loader2 className="animate-spin mr-2" /> : "نشر الفيديو"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
