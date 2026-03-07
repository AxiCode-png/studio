"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore, useUser } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User, Cake, ArrowRight } from 'lucide-react';

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const newUser = userCredential.user;

      const profileData = {
        id: newUser.uid,
        firstName: formData.firstName,
        lastName: formData.lastName,
        age: parseInt(formData.age) || 0,
        email: formData.email,
        joinedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', newUser.uid), profileData);
      await updateProfile(newUser, {
        displayName: `${formData.firstName} ${formData.lastName}`
      });

      toast({ title: "أهلاً بك في عالم AXI! 🎉", description: "تم إنشاء حسابك بنجاح." });
      router.push('/');
    } catch (error: any) {
      console.error("Sign up error:", error);
      let message = "حدث خطأ غير متوقع";
      if (error.code === 'auth/email-already-in-use') {
        message = "البريد مسجل مسبقاً! جرب الدخول بنفس الحساب.";
      } else if (error.code === 'auth/weak-password') {
        message = "كلمة السر ضعيفة جداً.";
      }
      toast({ title: "خطأ في التسجيل", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      toast({ title: "تم الدخول بنجاح! 🚀" });
      router.push('/');
    } catch (error: any) {
      console.error("Login error:", error);
      toast({ title: "خطأ في الدخول", description: "تأكد من البريد وكلمة السر.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (isUserLoading) return (
    <div className="h-screen w-full flex items-center justify-center bg-black">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
    </div>
  );

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[#0A0A0A] relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[150px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 blur-[150px] rounded-full" />

      <Card className="w-full max-w-md border-primary/20 bg-black/50 backdrop-blur-3xl shadow-[0_0_100px_rgba(0,229,255,0.15)] relative z-10 rounded-[3rem] overflow-hidden border">
        <CardHeader className="text-center pt-12 pb-8">
          <CardTitle className="text-7xl font-headline font-bold text-primary neon-text tracking-tighter italic">AXI</CardTitle>
          <CardDescription className="text-white/40 text-[11px] uppercase tracking-[0.5em] font-bold mt-3">Elite Content Platform</CardDescription>
        </CardHeader>
        <CardContent className="px-10 pb-12">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-10 bg-white/5 rounded-2xl p-1.5 h-14">
              <TabsTrigger value="login" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black font-bold uppercase text-xs transition-all">Login</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black font-bold uppercase text-xs transition-all">Join</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="animate-in fade-in slide-in-from-right-4 duration-500">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 size-5 group-focus-within:text-primary transition-colors" />
                    <Input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-12 bg-white/5 border-none h-14 text-white rounded-2xl focus:ring-1 focus:ring-primary/50 text-base"
                    />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 size-5 group-focus-within:text-primary transition-colors" />
                    <Input
                      type="password"
                      name="password"
                      placeholder="Password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-12 bg-white/5 border-none h-14 text-white rounded-2xl focus:ring-1 focus:ring-primary/50 text-base"
                    />
                  </div>
                </div>
                <Button className="w-full h-15 py-4 font-bold bg-primary text-black hover:bg-primary/90 text-xl rounded-2xl shadow-[0_10px_40px_rgba(0,229,255,0.3)] transition-all active:scale-95 mt-4 group" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : (
                    <div className="flex items-center gap-2">
                      Enter AXI <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="animate-in fade-in slide-in-from-left-4 duration-500">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 size-4 group-focus-within:text-primary transition-colors" />
                    <Input name="firstName" placeholder="First" required value={formData.firstName} onChange={handleInputChange} className="pl-11 bg-white/5 border-none h-12 text-white rounded-2xl" />
                  </div>
                  <Input name="lastName" placeholder="Last" required value={formData.lastName} onChange={handleInputChange} className="bg-white/5 border-none h-12 text-white rounded-2xl" />
                </div>
                <div className="relative group">
                  <Cake className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 size-5" />
                  <Input type="number" name="age" placeholder="Your Age" required value={formData.age} onChange={handleInputChange} className="pl-12 bg-white/5 border-none h-14 text-white rounded-2xl" />
                </div>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 size-5" />
                  <Input type="email" name="email" placeholder="Email" required value={formData.email} onChange={handleInputChange} className="pl-12 bg-white/5 border-none h-14 text-white rounded-2xl" />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 size-5" />
                  <Input type="password" name="password" placeholder="Password (min 6)" required value={formData.password} onChange={handleInputChange} className="pl-12 bg-white/5 border-none h-14 text-white rounded-2xl" />
                </div>
                <Button className="w-full h-15 py-4 font-bold bg-primary text-black hover:bg-primary/90 text-xl rounded-2xl shadow-[0_10px_40px_rgba(0,229,255,0.3)] transition-all active:scale-95 mt-4" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : "Start Journey"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}