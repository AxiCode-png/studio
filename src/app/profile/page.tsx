"use client";

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/navigation';
import { Grid, Lock, Bookmark, Heart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-background pb-20">
      <div className="flex flex-col items-center pt-12 px-4">
        <div className="relative mb-4">
          <Avatar className="w-24 h-24 border-4 border-muted ring-2 ring-primary">
            <AvatarImage src="https://picsum.photos/seed/me/200/200" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </div>

        <h2 className="text-xl font-headline font-bold mb-1">John Doe</h2>
        <p className="text-muted-foreground text-sm mb-4">@johndoe • 24 years old</p>

        <div className="flex gap-8 mb-6">
          <div className="text-center">
            <p className="font-bold text-lg">124</p>
            <p className="text-xs text-muted-foreground">Following</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-lg">1.5K</p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-lg">10.2K</p>
            <p className="text-xs text-muted-foreground">Likes</p>
          </div>
        </div>

        <div className="flex gap-3 w-full max-w-sm mb-8">
          <Button className="flex-1 bg-primary text-background font-bold">Edit Profile</Button>
          <Button variant="outline" className="flex-1 border-muted font-bold text-foreground">Share Profile</Button>
        </div>

        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="w-full bg-transparent border-b border-muted rounded-none h-12">
            <TabsTrigger value="videos" className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none"><Grid size={20} /></TabsTrigger>
            <TabsTrigger value="likes" className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none"><Heart size={20} /></TabsTrigger>
            <TabsTrigger value="bookmarks" className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none"><Bookmark size={20} /></TabsTrigger>
            <TabsTrigger value="private" className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none"><Lock size={20} /></TabsTrigger>
          </TabsList>
          
          <TabsContent value="videos" className="mt-1">
            <div className="grid grid-cols-3 gap-0.5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-[3/4] bg-muted relative group overflow-hidden">
                  <img 
                    src={`https://picsum.photos/seed/vid${i}/300/400`} 
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