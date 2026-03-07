
"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/navigation';
import { Grid, Bookmark, Heart, LogOut, Radio } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser, useDoc, useFirestore, useMemoFirebase, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc } from 'firebase/firestore';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth');
    }
  }, [user, isUserLoading, router]);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile } = useDoc(userDocRef);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      router.push('/auth');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (isUserLoading) return null;
  if (!user) return null;

  return (
    <main className="min-h-screen bg-[#0A0A0A] pb-20 overflow-x-hidden">
      <div className="flex flex-col items-center pt-12 px-4 text-center">
        <div className="relative mb-4">
          <Avatar className="w-24 h-24 border-4 border-muted ring-2 ring-primary shadow-[0_0_20px_rgba(0,229,255,0.3)]">
            <AvatarImage src={`https://picsum.photos/seed/${user.uid}/200/200`} />
            <AvatarFallback>{profile?.firstName?.[0] || 'U'}</AvatarFallback>
          </Avatar>
        </div>

        <h2 className="text-2xl font-headline font-bold mb-1 text-white">
          {profile ? `${profile.firstName} ${profile.lastName}` : 'AXI User'}
        </h2>
        
        <div className="flex items-center gap-2 mb-6">
          <p className="text-primary/70 text-sm font-medium">@{profile?.firstName?.toLowerCase() || 'user'}</p>
          {profile?.age && (
            <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold border border-primary/20">
              {profile.age} سنة
            </span>
          )}
        </div>

        <div className="flex gap-10 mb-8">
          <div className="text-center">
            <p className="font-bold text-xl text-white">0</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">فيديو</p>
          </div>
          <div className="text-center border-x border-white/10 px-10">
            <p className="font-bold text-xl text-white">1.2K</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">متابع</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-xl text-white">850</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">متابعة</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-8">
          <Button className="bg-primary text-black font-bold hover:bg-primary/80 transition-all">تعديل الملف</Button>
          <Button variant="outline" className="border-white/10 text-white font-bold hover:bg-white/5" onClick={() => router.push('/live')}>
            <Radio size={16} className="mr-2 text-primary" /> لايف
          </Button>
          <Button variant="ghost" className="col-span-2 text-destructive font-bold hover:bg-destructive/10" onClick={handleLogout}>
            <LogOut size={16} className="mr-2" /> تسجيل الخروج من AXI
          </Button>
        </div>

        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="w-full bg-transparent border-b border-white/5 rounded-none h-12 p-0">
            <TabsTrigger value="videos" className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none"><Grid size={22} className="text-white" /></TabsTrigger>
            <TabsTrigger value="likes" className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none"><Heart size={22} className="text-white" /></TabsTrigger>
            <TabsTrigger value="bookmarks" className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none"><Bookmark size={22} className="text-white" /></TabsTrigger>
          </TabsList>
          
          <TabsContent value="videos" className="mt-1">
            <div className="grid grid-cols-3 gap-0.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[3/4] bg-muted/20 relative group overflow-hidden">
                  <img 
                    src={`https://picsum.photos/seed/vid${i}${user.uid}/300/400`} 
                    alt="AXI Content" 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-2 flex items-center gap-1">
                    <Heart size={12} className="fill-primary text-primary" />
                    <span className="text-[10px] text-white font-bold">12K</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Navigation />
    </main>
  );
}
