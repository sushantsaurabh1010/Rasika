
// src/app/login/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, UserPlus, LogInIcon, Users, Eye, EyeOff, KeyRound, User, Zap, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import Image from 'next/image';

// Inline SVG for Google G logo
const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" width="1024px" height="1024px" className="mr-2">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
    <path fill="none" d="M0 0h48v48H0z"></path>
  </svg>
);


export default function LoginPage() {
  const { user, loading, isSettingUpNewProfile, signInWithEmailPassword, signUpWithEmailPassword, signInWithGoogle, signInAsGuest, sendPasswordReset } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [emailOrUsername, setEmailOrUsername] = useState(''); 
  const [usernameForSignUp, setUsernameForSignUp] = useState(''); 
  const [emailForSignUp, setEmailForSignUp] = useState(''); 
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false);
  const [isSignUpDialogOpen, setIsSignUpDialogOpen] = useState(false);

  useEffect(() => {
    if (!loading && user && !isSettingUpNewProfile) { // Ensure profile setup is complete before redirect
      router.push('/');
    }
  }, [user, loading, isSettingUpNewProfile, router]);

  useEffect(() => {
    const rememberedEmailOrUsername = localStorage.getItem('rememberedEmailOrUsername');
    if (rememberedEmailOrUsername) {
      setEmailOrUsername(rememberedEmailOrUsername);
      setRememberMe(true);
    }
  }, []);

  const clearFormFields = () => {
    if (!localStorage.getItem('rememberedEmailOrUsername')) {
       setEmailOrUsername('');
    }
    setEmailForSignUp('');
    setUsernameForSignUp('');
    setPassword('');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrUsername || !password) {
      toast({ title: "Missing Fields", description: "Please enter your email/username and password.", variant: "destructive" });
      return;
    }
    if (rememberMe) {
      localStorage.setItem('rememberedEmailOrUsername', emailOrUsername);
    } else {
      localStorage.removeItem('rememberedEmailOrUsername');
    }
    await signInWithEmailPassword(emailOrUsername, password, rememberMe);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForSignUp || !password || !usernameForSignUp) {
      toast({ title: "Missing Fields", description: "Please enter email, username, and password.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Weak Password", description: "Password should be at least 6 characters.", variant: "destructive" });
      return;
    }
    await signUpWithEmailPassword(emailForSignUp, password, usernameForSignUp, true);
  };

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleGuestSignIn = async () => {
    await signInAsGuest();
  };

  const handlePasswordReset = async () => {
    if (!emailOrUsername) {
      toast({
        title: "Email Required",
        description: "Please enter your email address in the field to reset your password.",
        variant: "destructive",
      });
      return;
    }
    await sendPasswordReset(emailOrUsername);
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  if (loading && !isSettingUpNewProfile) { // Show general loading only if not in specific profile setup phase
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Zap className="h-12 w-12 text-primary animate-pulse" />
      </div>
    );
  }
  
  // If user is logged in and profile setup is done, redirect handled by useEffect.
  // This check is to prevent rendering login form if already logged in and not setting up profile.
  if (user && !isSettingUpNewProfile) { 
     return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Zap className="h-12 w-12 text-primary animate-pulse" />
      </div>
    );
  }


  return (
    <div className="min-h-screen flex-col bg-cover bg-center relative p-4" 
    style={{ backgroundImage: "url('/Login-bg.png')" }} >
      <main className="flex-grow flex flex-col items-center justify-center">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex items-center justify-center">
              <Image
                src="/rasika-logo.png" 
                alt="Rasika Logo"
                width={110} 
                height={110} 
                className="h-36 w-36 mix-blend-multiply dark:mix-blend-normal" 
                priority
              />
            </div>
            <CardTitle className="text-3xl font-headline text-primary">Rasika</CardTitle>
            <CardDescription className="text-lg font-body text-foreground/80 pt-2">
              Sign in, create an account, or continue as guest.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 pt-6 pb-2">
            <Dialog open={isSignInDialogOpen} onOpenChange={(isOpen) => { setIsSignInDialogOpen(isOpen); if (!isOpen) clearFormFields(); }}>
              <DialogTrigger asChild>
                <Button className="w-full py-3 text-base bg-primary hover:bg-primary/90 text-primary-foreground" size="lg">
                  <LogInIcon className="mr-2 h-5 w-5" />
                  Sign In
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-headline text-2xl text-primary">Sign In</DialogTitle>
                  <DialogDescription>Enter your credentials to access your account.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSignIn}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="signInEmailOrUsername">Email or Username</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input id="signInEmailOrUsername" type="text" placeholder="you@example.com or your_username" value={emailOrUsername} onChange={(e) => setEmailOrUsername(e.target.value)} required className="pl-10" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signInPassword">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input id="signInPassword" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-10 pr-10" />
                        <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground" onClick={toggleShowPassword}>
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="remember-me-dialog" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(Boolean(checked))} />
                        <Label htmlFor="remember-me-dialog" className="text-sm font-medium">Remember me</Label>
                      </div>
                      <Button type="button" variant="link" className="p-0 h-auto text-sm text-primary hover:underline" onClick={handlePasswordReset} disabled={loading}>
                        <KeyRound className="mr-1 h-4 w-4" /> Forgot Password?
                      </Button>
                    </div>
                  </div>
                  <DialogFooter>
                     <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      <LogInIcon className="mr-2 h-4 w-4" /> Sign In
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isSignUpDialogOpen} onOpenChange={(isOpen) => { setIsSignUpDialogOpen(isOpen); if (!isOpen) clearFormFields(); }}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full py-3 text-base" size="lg">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Create Account
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-headline text-2xl text-primary">Create Account</DialogTitle>
                  <DialogDescription>Fill in the details to create your new account.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSignUp}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="signUpEmail">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input id="signUpEmail" type="email" placeholder="you@example.com" value={emailForSignUp} onChange={(e) => setEmailForSignUp(e.target.value)} required className="pl-10" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signUpUsername">Username</Label>
                       <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input id="signUpUsername" type="text" placeholder="Letters, numbers, underscores, min 3 chars" value={usernameForSignUp} onChange={(e) => setUsernameForSignUp(e.target.value)} required className="pl-10" />
                      </div>
                      <p className="text-xs text-muted-foreground px-1">Min 3 characters. Only letters, numbers, and underscores (_) allowed. This will be your login username (case-insensitive) and display name.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signUpPassword">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input id="signUpPassword" type={showPassword ? 'text' : 'password'} placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-10 pr-10" />
                        <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground" onClick={toggleShowPassword}>
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={loading || isSettingUpNewProfile} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      <UserPlus className="mr-2 h-4 w-4" /> Create Account
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-2">
            <div className="w-full flex items-center gap-2 my-2">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">OR</span>
              <Separator className="flex-1" />
            </div>

            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full py-3 text-base border-border hover:bg-muted/80"
              size="lg"
              disabled={loading || isSettingUpNewProfile}
            >
              <GoogleIcon />
              Sign in with Google
            </Button>

            <Button
              onClick={handleGuestSignIn}
              variant="secondary"
              className="w-full py-3 text-base"
              size="lg"
              disabled={loading || isSettingUpNewProfile}
            >
              <Users className="mr-2 h-5 w-5" />
              Sign in as Guest
            </Button>
          </CardFooter>
        </Card>
      </main>
      <footer className="py-6 text-center w-full text-sm text-muted-foreground font-body">
        &copy; {new Date().getFullYear()} Rasika.
      </footer>

      {/* Profile Setup Loading Dialog */}
      <Dialog open={isSettingUpNewProfile} onOpenChange={() => { /* Controlled by state, no manual close */ }}>
        <DialogContent className="sm:max-w-md" hideCloseButton={true}> {/* Assuming hideCloseButton prop or similar for DialogContent might be needed, or ensure DialogClose is not rendered */}
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl text-primary text-center">Setting Up Your Account</DialogTitle>
          </DialogHeader>
          <div className="py-6 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-foreground/80 text-center">Please wait a moment, setting up your profile...</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper to add hideCloseButton to DialogContent if needed, or just don't include a <DialogClose>
// For ShadCN's Dialog, the X button is part of DialogContent by default.
// To make it truly non-dismissible via UI, you'd typically handle `onOpenChange` to prevent state change,
// or customize the DialogContent component not to render the close button.
// Here, since `open` is directly bound, clicking X would call `onOpenChange` which does nothing, effectively keeping it open.
// If DialogContent's "X" is an issue, a custom DialogContent or overriding its close functionality would be next.
// For now, this setup should keep the dialog open as long as `isSettingUpNewProfile` is true.

