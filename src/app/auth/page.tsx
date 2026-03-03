"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { auth } = useAuth() as any; // Cast to bypass strict type check if needed, but initializeFirebase returns auth
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    email: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: `${formData.firstName} ${formData.lastName}`
      });

      // Create UserProfile document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        firstName: formData.firstName,
        lastName: formData.lastName,
        age: parseInt(formData.age),
        email: formData.email
      });

      toast({ title: "Account created successfully!" });
      router.push('/');
    } catch (error: any) {
      toast({ title: "Auth Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      toast({ title: "Welcome back!" });
      router.push('/');
    } catch (error: any) {
      toast({ title: "Login Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-primary">AXI Shorts</CardTitle>
          <CardDescription>Join the future of short videos</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Input 
                    type="email" 
                    name="email" 
                    placeholder="Email" 
                    required 
                    onChange={handleInputChange}
                    className="bg-muted/50 border-none"
                  />
                  <Input 
                    type="password" 
                    name="password" 
                    placeholder="Password" 
                    required 
                    onChange={handleInputChange}
                    className="bg-muted/50 border-none"
                  />
                </div>
                <Button className="w-full font-bold" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : "Login"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Input 
                    name="firstName" 
                    placeholder="First Name" 
                    required 
                    onChange={handleInputChange}
                    className="bg-muted/50 border-none"
                  />
                  <Input 
                    name="lastName" 
                    placeholder="Last Name" 
                    required 
                    onChange={handleInputChange}
                    className="bg-muted/50 border-none"
                  />
                </div>
                <Input 
                  type="number" 
                  name="age" 
                  placeholder="Age" 
                  required 
                  onChange={handleInputChange}
                  className="bg-muted/50 border-none"
                />
                <Input 
                  type="email" 
                  name="email" 
                  placeholder="Email" 
                  required 
                  onChange={handleInputChange}
                  className="bg-muted/50 border-none"
                />
                <Input 
                  type="password" 
                  name="password" 
                  placeholder="Password" 
                  required 
                  onChange={handleInputChange}
                  className="bg-muted/50 border-none"
                />
                <Button className="w-full font-bold" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}
