"use client";

import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Sparkles, Loader2, Upload, Video, FileVideo } from 'lucide-react';
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
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
      setSelectedFile(null); // Clear manual file if AI generated
      toast({ title: "تم توليد الفيديو بنجاح! 🎬" });
    } catch (error) {
      console.error(error);
      toast({ title: "فشل توليد الفيديو بالذكاء الاصطناعي.", description: "تأكد من إعداد مفتاح API بشكل صحيح.", variant: "destructive" });
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast({ title: "حجم الفيديو كبير جداً", description: "الحد الأقصى هو 50 ميجابايت.", variant: "destructive" });
        return;
      }
      setSelectedFile(file);
      setVideoUrl(URL.createObjectURL(file)); // Preview for the user
      toast({ title: "تم اختيار الفيديو بنجاح!" });
    }
  };

  const handleUpload = () => {
    if (!user) {
      toast({ title: "يرجى تسجيل الدخول للنشر.", variant: "destructive" });
      return;
    }
    if (!title || !videoUrl) {
      toast({ title: "العنوان والفيديو مطلوبان.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    
    // In a real app, we would upload to Firebase Storage here.
    // For this prototype, we store the URL (Blob or AI Data URI).
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
      toast({ title: "تم النشر بنجاح على AXI PRO MAX!" });
    });
  };

  const resetForm = () => {
    setDescription('');
    setTitle('');
    setHashtags([]);
    setVideoUrl('');
    setSelectedFile(null);
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
      <DialogContent className="sm:max-w-md bg-background border-border text-foreground overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary text-center">انشر إبداعك</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div 
              onClick={handleGenerateVideo}
              className="border-2 border-dashed border-primary/30 rounded-xl p-6 flex flex-col items-center justify-center gap-2 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer text-center"
            >
              {isGeneratingVideo ? (
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              ) : (
                <Sparkles className="w-8 h-8 text-primary" />
              )}
              <p className="text-[10px] font-bold text-primary uppercase tracking-tighter">AI Video</p>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-accent/30 rounded-xl p-6 flex flex-col items-center justify-center gap-2 bg-accent/5 hover:bg-accent/10 transition-colors cursor-pointer text-center"
            >
              <Upload className="w-8 h-8 text-accent" />
              <p className="text-[10px] font-bold text-accent uppercase tracking-tighter">Phone Upload</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="video/*" 
                onChange={handleFileSelect}
              />
            </div>
          </div>

          {videoUrl && (
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-white/10">
              <video src={videoUrl} className="w-full h-full object-contain" controls />
              <div className="absolute top-2 right-2 bg-primary/80 text-black text-[10px] px-2 py-0.5 rounded font-bold">
                {selectedFile ? 'LOCAL' : 'AI GENERATED'}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">وصف الفيديو</label>
              <div className="relative">
                <Textarea 
                  placeholder="مثال: قطة تلعب في الحديقة..." 
                  className="bg-muted/30 border-none resize-none pr-12 text-white h-24"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="absolute bottom-2 right-2 text-primary"
                  onClick={handleGenerateAI}
                  disabled={isGenerating}
                >
                  {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">العنوان</label>
              <Input 
                placeholder="عنوان جذاب للفيديو..." 
                className="bg-muted/30 border-none text-white h-12" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {hashtags.map(tag => (
                  <span key={tag} className="px-2 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <Button 
            className="w-full bg-primary text-black font-bold h-14 text-lg hover:bg-primary/90 shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all active:scale-95"
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
