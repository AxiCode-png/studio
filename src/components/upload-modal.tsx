"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Sparkles, Loader2, Upload } from 'lucide-react';
import { generateCaptionAndHashtags } from '@/ai/flows/ai-caption-and-hashtag-generator';
import { toast } from '@/hooks/use-toast';
import { useFirestore, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';

export function UploadModal() {
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [open, setOpen] = useState(false);
  
  const { user } = useUser();
  const db = useFirestore();

  const handleGenerateAI = async () => {
    if (!description.trim()) {
      toast({ title: "Please enter a video description first.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateCaptionAndHashtags({ videoDescription: description });
      setTitle(result.title);
      setHashtags(result.hashtags);
    } catch (error) {
      toast({ title: "Failed to generate caption.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpload = () => {
    if (!user) {
      toast({ title: "Please sign in to upload.", variant: "destructive" });
      return;
    }
    if (!title || !description) {
      toast({ title: "Title and description are required.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    
    // In a real app, you would upload to Firebase Storage first.
    // For this prototype, we'll use a placeholder video URL.
    const mockVideoUrl = "https://cdn.pixabay.com/vimeo/328941243/sunset-23136.mp4?width=1280&hash=1406e22c07338e3e4f624867e3a968600d3d5f30";

    const videosRef = collection(db, 'videos');
    
    addDocumentNonBlocking(videosRef, {
      title,
      description,
      hashtags,
      videoUrl: mockVideoUrl,
      uploaderId: user.uid,
      likesCount: 0,
      uploadTimestamp: serverTimestamp()
    }).then(() => {
      setIsUploading(false);
      setOpen(false);
      setDescription('');
      setTitle('');
      setHashtags([]);
      toast({ title: "Video uploaded successfully!" });
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
          <DialogTitle className="font-headline text-2xl text-primary">Upload Video</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          <div className="border-2 border-dashed border-muted rounded-xl p-8 flex flex-col items-center justify-center gap-3 bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer">
            <Upload className="w-10 h-10 text-primary" />
            <p className="text-sm text-muted-foreground font-medium">Select a video file to upload</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">What's in your video?</label>
              <div className="relative">
                <Textarea 
                  placeholder="E.g. A sunset timelapse at the beach..." 
                  className="bg-muted/50 border-none resize-none pr-12"
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
                <Sparkles size={10} /> Powered by AXI-AI
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">Title</label>
              <Input 
                placeholder="Video title" 
                className="bg-muted/50 border-none" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">Hashtags</label>
              <div className="flex flex-wrap gap-2">
                {hashtags.length > 0 ? (
                  hashtags.map(tag => (
                    <span key={tag} className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                      #{tag}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic">No hashtags generated yet</p>
                )}
              </div>
            </div>
          </div>

          <Button 
            className="w-full bg-primary text-background font-bold h-12 text-lg hover:bg-primary/90"
            disabled={isUploading}
            onClick={handleUpload}
          >
            {isUploading ? <Loader2 className="animate-spin mr-2" /> : "Post Video"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
