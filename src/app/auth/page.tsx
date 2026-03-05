"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore, useUser, initiateEmailSignIn, initiateEmailSignUp, setDocumentNonBlocking } from '@/firebase';
import { updateProfile } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Mail, Lock, Cake } from 'lucide-react';

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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.endsWith("@gmail.com")) {
      toast({ title: "الرجاء استخدام Gmail فقط!", variant: "destructive" });
      return;
    }
    if (!auth) return;
    setIsLoading(true);
    try {
      initiateEmailSignUp(auth, formData.email, formData.password);
      toast({ title: "جاري إنشاء حسابك في AXI PRO MAX..." });
    } catch (error) {
      toast({ title: "حدث خطأ أثناء التسجيل", variant: "destructive" });
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoading(true);
    try {
      initiateEmailSignIn(auth, formData.email, formData.password);
      toast({ title: "جاري الدخول إلى عالم AXI..." });
    } catch (error) {
      toast({ title: "فشل تسجيل الدخول", variant: "destructive" });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && formData.firstName && !isUserLoading && db) {
      const userRef = doc(db, 'users', user.uid);
      setDocumentNonBlocking(userRef, {
        id: user.uid,
        firstName: formData.firstName,
        lastName: formData.lastName,
        age: parseInt(formData.age) || 0,
        email: formData.email,
        joinedAt: new Date().toISOString()
      }, { merge: true });
      
      updateProfile(user, {
        displayName: `${formData.firstName} ${formData.lastName}`
      }).catch(() => {});
    }
  }, [user, db, formData.firstName, isUserLoading, formData.lastName, formData.age, formData.email]);

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[#0A0A0A]">
      <Card className="w-full max-w-md border-primary/20 bg-card/80 backdrop-blur-xl shadow-[0_0_50px_rgba(0,229,255,0.1)]">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-5xl font-headline font-bold text-primary tracking-tighter neon-text">AXI</CardTitle>
          <CardDescription className="text-white/50 tracking-[0.2em] font-bold text-xs uppercase">Pro Max Edition</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/20">
              <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-black font-bold">تسجيل دخول</TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-black font-bold">حساب جديد</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-primary size-5" />
                  <Input 
                    type="email" 
                    name="email" 
                    placeholder="الجيميل (@gmail.com)" 
                    required 
                    onChange={handleInputChange}
                    className="pl-11 bg-white/5 border-none h-12 text-white placeholder:text-white/30"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-primary size-5" />
                  <Input 
                    type="password" 
                    name="password" 
                    placeholder="كلمة السر" 
                    required 
                    onChange={handleInputChange}
                    className="pl-11 bg-white/5 border-none h-12 text-white placeholder:text-white/30"
                  />
                </div>
                <Button className="w-full h-12 font-bold text-lg bg-primary text-black hover:bg-primary/90 shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all active:scale-95" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : "دخول إلى عالم AXI"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-primary size-4" />
                    <Input 
                      name="firstName" 
                      placeholder="الاسم" 
                      required 
                      onChange={handleInputChange}
                      className="pl-10 bg-white/5 border-none h-11 text-sm text-white placeholder:text-white/30"
                    />
                  </div>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-primary size-4" />
                    <Input 
                      name="lastName" 
                      placeholder="اللقب" 
                      required 
                      onChange={handleInputChange}
                      className="pl-10 bg-white/5 border-none h-11 text-sm text-white placeholder:text-white/30"
                    />
                  </div>
                </div>
                <div className="relative">
                  <Cake className="absolute left-3 top-3 text-primary size-5" />
                  <Input 
                    type="number" 
                    name="age" 
                    placeholder="العمر" 
                    required 
                    onChange={handleInputChange}
                    className="pl-11 bg-white/5 border-none h-12 text-white placeholder:text-white/30"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-primary size-5" />
                  <Input 
                    type="email" 
                    name="email" 
                    placeholder="الجيميل (@gmail.com)" 
                    required 
                    onChange={handleInputChange}
                    className="pl-11 bg-white/5 border-none h-12 text-white placeholder:text-white/30"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-primary size-5" />
                  <Input 
                    type="password" 
                    name="password" 
                    placeholder="كلمة السر" 
                    required 
                    onChange={handleInputChange}
                    className="pl-11 bg-white/5 border-none h-12 text-white placeholder:text-white/30"
                  />
                </div>
                <Button className="w-full h-12 font-bold text-lg bg-primary text-black hover:bg-primary/90 shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all active:scale-95" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : "إنضم إلى AXI PRO MAX"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}