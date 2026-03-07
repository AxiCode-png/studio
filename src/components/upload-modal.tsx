"use client";

import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, Sparkles, Loader2, Upload, CheckCircle2, Zap } from 'lucide-react';
import { generateCaptionAndHashtags } from '@/ai/flows/ai-caption-and-hashtag-generator';
import { generateAIVideo } from '@/ai/flows/ai-video-generator';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useStorage, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export function UploadModal() {
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [open, setOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useUser();
  const db = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();

  const handleGenerateAI = async () => {
    if (!description.trim()) {
      toast({ title: "الرجاء إدخال فكرة للفيديو.", variant: "destructive" });
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
      toast({ title: "اكتب فكرة لتحويلها لفيديو AXI AI.", variant: "destructive" });
      return;
    }
    setIsGeneratingVideo(true);
    try {
      toast({ 
        title: "جاري تحويل الفكرة إلى فيديو سينمائي...", 
        description: "تقنية Veo 2.0 تعمل الآن على طلبك.",
      });
      const result = await generateAIVideo({ prompt: description });
      setVideoUrl(result.videoDataUri);
      setSelectedFile(null);
      toast({ title: "تم توليد الفيديو بنجاح! 🎬" });
    } catch (error: any) {
      toast({ 
        title: "خطأ في الذكاء الاصطناعي", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const MAX_SIZE = 100 * 1024 * 1024; // 100MB
      if (file.size > MAX_SIZE) { 
        toast({ 
          title: "حجم الفيديو كبير جداً", 
          description: "الحد الأقصى هو 100 ميجابايت.", 
          variant: "destructive" 
        });
        return;
      }
      
      setSelectedFile(file);
      setVideoUrl(URL.createObjectURL(file));
      toast({ title: "تم اختيار الفيديو بنجاح! ✅" });
    }
  };

  const handleUpload = async () => {
    if (!user) {
      toast({ title: "يرجى تسجيل الدخول أولاً.", variant: "destructive" });
      return;
    }
    if (!title || !videoUrl) {
      toast({ title: "العنوان والفيديو مطلوبان.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    let finalVideoUrl = videoUrl;

    try {
      if (selectedFile) {
        toast({ title: "جاري الرفع السريع لـ AXI Storage..." });
        const storageRef = ref(storage, `videos/${user.uid}/${Date.now()}_${selectedFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, selectedFile);

        finalVideoUrl = await new Promise((resolve, reject) => {
          uploadTask.on('state_changed', 
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            }, 
            (error) => {
              console.error("Storage upload error:", error);
              reject(error);
            }, 
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            }
          );
        });
      }

      const videosRef = collection(db, 'videos');
      addDocumentNonBlocking(videosRef, {
        title,
        description,
        hashtags,
        videoUrl: finalVideoUrl,
        uploaderId: user.uid,
        likesCount: 0,
        uploadTimestamp: serverTimestamp()
      });

      setIsUploading(false);
      setOpen(false);
      resetForm();
      toast({ title: "تم النشر بنجاح! 🚀" });
    } catch (err: any) {
      console.error("Final upload error:", err);
      setIsUploading(false);
      toast({ 
        title: "فشل النشر", 
        description: "تأكد من تفعيل Storage في Firebase.", 
        variant: "destructive" 
      });
    }
  };

  const resetForm = () => {
    setDescription('');
    setTitle('');
    setHashtags([]);
    setVideoUrl('');
    setSelectedFile(null);
    setUploadProgress(0);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex flex-col items-center justify-center p-2 text-white transition-transform active:scale-90">
          <div className="relative scale-110">
            <div className="absolute inset-0 bg-primary blur-lg opacity-40 rounded-full"></div>
            <PlusCircle size={44} className="relative z-10 text-primary fill-background" />
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-background border-primary/20 text-foreground overflow-y-auto max-h-[95vh] backdrop-blur-2xl p-6 rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="font-headline text-3xl text-primary text-center neon-text tracking-tighter italic mb-2 flex items-center justify-center gap-2">
            <Zap className="size-6 text-primary animate-pulse" /> AXI PUBLISH PRO
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-2">
          <div className="grid grid-cols-2 gap-4 h-32">
            <button 
              onClick={handleGenerateVideo}
              disabled={isGeneratingVideo}
              className="border-2 border-dashed border-primary/30 rounded-2xl flex flex-col items-center justify-center gap-2 bg-primary/5 hover:bg-primary/10 transition-all active:scale-95 group"
            >
              {isGeneratingVideo ? (
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              ) : (
                <Sparkles className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
              )}
              <div className="text-center">
                <p className="text-[10px] font-bold text-primary uppercase">AXI-AI Video</p>
                <p className="text-[8px] text-white/40">From Idea to Reality</p>
              </div>
            </button>

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-accent/30 rounded-2xl flex flex-col items-center justify-center gap-2 bg-accent/5 hover:bg-accent/10 transition-all active:scale-95 group"
            >
              <Upload className="w-8 h-8 text-accent group-hover:-translate-y-1 transition-transform" />
              <div className="text-center">
                <p className="text-[10px] font-bold text-accent uppercase">Phone Upload</p>
                <p className="text-[8px] text-white/40">Up to 100MB</p>
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
                READY FOR WORLD
              </div>
            </div>
          )}

          {isUploading && selectedFile && (
            <div className="space-y-2 p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="flex justify-between text-[10px] font-bold text-primary uppercase">
                <span>جاري الرفع الفائق السرعة...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-1.5 bg-white/5" />
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.2em] ml-1">Your Idea</label>
              <div className="relative">
                <Textarea 
                  placeholder="اكتب فكرتك هنا وسيقوم AXI AI بتحويلها لمشهد سينمائي..." 
                  className="bg-white/5 border-none resize-none pr-10 text-white h-24 rounded-xl focus:ring-1 focus:ring-primary/30"
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
              <label className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.2em] ml-1">Video Title</label>
              <Input 
                placeholder="عنوان جذاب للفيديو..." 
                className="bg-white/5 border-none text-white h-12 rounded-xl focus:ring-1 focus:ring-primary/30" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <Button 
            className="w-full bg-primary text-black font-bold h-15 rounded-2xl text-lg hover:bg-primary/90 shadow-[0_10px_40px_rgba(0,229,255,0.3)] transition-all active:scale-95"
            disabled={isUploading || isGeneratingVideo || !videoUrl}
            onClick={handleUpload}
          >
            {isUploading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin" /> جاري النشر...
              </div>
            ) : "انشر الآن للعالم"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}