"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore, useUser } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User, Cake } from 'lucide-react';

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

      await setDoc(doc(db, 'users', newUser.uid), {
        id: newUser.uid,
        firstName: formData.firstName,
        lastName: formData.lastName,
        age: parseInt(formData.age) || 0,
        email: formData.email,
        joinedAt: new Date().toISOString()
      });

      await updateProfile(newUser, {
        displayName: `${formData.firstName} ${formData.lastName}`
      });

      toast({ title: "أهلاً بك في عالم AXI PRO MAX! 🎉" });
      router.push('/');
    } catch (error: any) {
      let message = "حدث خطأ أثناء التسجيل";
      if (error.code === 'auth/email-already-in-use') message = "هذا البريد مسجل مسبقاً!";
      else if (error.code === 'auth/weak-password') message = "كلمة السر يجب أن تكون 6 أحرف على الأقل";
      toast({ title: message, variant: "destructive" });
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
      toast({ title: "خطأ في البريد أو كلمة السر", variant: "destructive" });
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
    <main className="min-h-screen flex items-center justify-center p-4 bg-[#0A0A0A]">
      <Card className="w-full max-w-md border-primary/20 bg-card/80 backdrop-blur-xl shadow-[0_0_50px_rgba(0,229,255,0.15)]">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-5xl font-headline font-bold text-primary neon-text tracking-tighter">AXI</CardTitle>
          <CardDescription className="text-white/50 text-xs uppercase tracking-widest font-bold">Pro Max AI Edition</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/20 p-1">
              <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-black font-bold uppercase">دخول</TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-black font-bold uppercase">تسجيل</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-primary size-5" />
                  <Input
                    type="email"
                    name="email"
                    placeholder="البريد الإلكتروني"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-11 bg-white/5 border-none h-12 text-white"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-primary size-5" />
                  <Input
                    type="password"
                    name="password"
                    placeholder="كلمة السر"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-11 bg-white/5 border-none h-12 text-white"
                  />
                </div>
                <Button className="w-full h-12 font-bold bg-primary text-black hover:bg-primary/90 text-lg shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all active:scale-95" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : "دخول إلى AXI"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-primary size-4" />
                    <Input name="firstName" placeholder="الاسم" required value={formData.firstName} onChange={handleInputChange} className="pl-10 bg-white/5 border-none h-11 text-white" />
                  </div>
                  <Input name="lastName" placeholder="اللقب" required value={formData.lastName} onChange={handleInputChange} className="bg-white/5 border-none h-11 text-white" />
                </div>
                <div className="relative">
                  <Cake className="absolute left-3 top-3 text-primary size-5" />
                  <Input type="number" name="age" placeholder="العمر" required value={formData.age} onChange={handleInputChange} className="pl-11 bg-white/5 border-none h-12 text-white" />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-primary size-5" />
                  <Input type="email" name="email" placeholder="البريد الإلكتروني" required value={formData.email} onChange={handleInputChange} className="pl-11 bg-white/5 border-none h-12 text-white" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-primary size-5" />
                  <Input type="password" name="password" placeholder="كلمة السر" required value={formData.password} onChange={handleInputChange} className="pl-11 bg-white/5 border-none h-12 text-white" />
                </div>
                <Button className="w-full h-12 font-bold bg-primary text-black hover:bg-primary/90 text-lg shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all active:scale-95" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : "إنضم الآن"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}
