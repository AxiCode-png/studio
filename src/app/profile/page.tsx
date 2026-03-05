"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/navigation';
import { Grid, Lock, Bookmark, Heart, LogOut } from 'lucide-react';
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
    try {
      await signOut(auth);
      router.push('/auth');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (isUserLoading || !user) return null;

  return (
    <main className="min-h-screen bg-background pb-20">
      <div className="flex flex-col items-center pt-12 px-4 text-center">
        <div className="relative mb-4">
          <Avatar className="w-24 h-24 border-4 border-muted ring-2 ring-primary">
            <AvatarImage src={`https://picsum.photos/seed/${user.uid}/200/200`} />
            <AvatarFallback>{profile?.firstName?.[0] || 'U'}</AvatarFallback>
          </Avatar>
        </div>

        <h2 className="text-xl font-headline font-bold mb-1 text-white">
          {profile ? `${profile.firstName} ${profile.lastName}` : 'جاري التحميل...'}
        </h2>
        <div className="flex items-center gap-2 mb-4">
          <p className="text-muted-foreground text-sm">
            {profile ? `@${profile.firstName?.toLowerCase()}${profile.lastName?.toLowerCase()}` : '@user'} 
          </p>
          {profile?.age && (
            <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">
              {profile.age} سنة
            </span>
          )}
        </div>

        <div className="flex gap-8 mb-6 text-white">
          <div className="text-center">
            <p className="font-bold text-lg">124</p>
            <p className="text-xs text-muted-foreground">متابعة</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-lg">1.5K</p>
            <p className="text-xs text-muted-foreground">متابعون</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-lg">10.2K</p>
            <p className="text-xs text-muted-foreground">إعجابات</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full max-w-sm mb-8">
          <div className="flex gap-3">
            <Button className="flex-1 bg-primary text-background font-bold hover:bg-primary/80 transition-all">تعديل الملف</Button>
            <Button variant="outline" className="flex-1 border-muted font-bold text-foreground">مشاركة</Button>
          </div>
          <Button variant="ghost" className="text-destructive font-bold flex items-center gap-2 hover:bg-destructive/10" onClick={handleLogout}>
            <LogOut size={16} /> تسجيل الخروج من AXI
          </Button>
        </div>

        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="w-full bg-transparent border-b border-muted rounded-none h-12">
            <TabsTrigger value="videos" className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none"><Grid size={20} className="text-white" /></TabsTrigger>
            <TabsTrigger value="likes" className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none"><Heart size={20} className="text-white" /></TabsTrigger>
            <TabsTrigger value="bookmarks" className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none"><Bookmark size={20} className="text-white" /></TabsTrigger>
            <TabsTrigger value="private" className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none"><Lock size={20} className="text-white" /></TabsTrigger>
          </TabsList>
          
          <TabsContent value="videos" className="mt-1">
            <div className="grid grid-cols-3 gap-0.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[3/4] bg-muted relative group overflow-hidden">
                  <img 
                    src={`https://picsum.photos/seed/vid${i}${user.uid}/300/400`} 
                    alt="Post" 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute bottom-2 left-2 flex items-center gap-1">
                    <Heart size={12} className="fill-white text-white" />
                    <span className="text-[10px] text-white font-bold">2.4K</span>
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