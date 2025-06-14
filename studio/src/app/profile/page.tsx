
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react'; // Removed useState
import { useAuth } from '@/lib/firebase/AuthContext';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { User, ListCollapse, MessageSquareText, LogOut, ChevronRight, Home, Eye } from 'lucide-react'; // Added Eye
import Image from 'next/image';
// Removed getUserHistory and RecommendationItem imports as they are no longer used directly here

export default function ProfilePage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  // Removed state and useEffect for viewedItems, historyLoading, historyError

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow w-full max-w-2xl flex flex-col items-center justify-center">
          <Skeleton className="h-24 w-24 rounded-full mb-6" />
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-6 w-3/4 mb-8" />
          <div className="space-y-4 w-full">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" /> {/* Added skeleton for the new button */}
            <Skeleton className="h-12 w-1/3 mt-6 self-start rounded-lg" />
          </div>
        </main>
      </div>
    );
  }

  if (!user) { 
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background text-foreground flex flex-col selection:bg-primary/30 selection:text-primary-foreground">
      <Header />
      <main className="container mx-auto px-4 py-12 flex-grow w-full max-w-2xl">
        <div className="mb-6">
            <Button variant="outline" size="sm" asChild>
                <Link href="/" className="flex items-center">
                    <Home className="mr-2 h-4 w-4" />
                    Back to Home
                </Link>
            </Button>
        </div>
        <Card className="shadow-xl rounded-lg mb-8">
          <CardHeader className="text-center border-b pb-6 bg-card rounded-t-lg">
             <div className="relative mx-auto mb-4 h-24 w-24">
              {user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt={user.displayName || 'User avatar'}
                  width={96}
                  height={96}
                  className="rounded-full object-cover border-2 border-primary shadow-md"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center border-2 border-primary shadow-md">
                  <User className="h-12 w-12 text-primary" />
                </div>
              )}
            </div>
            <CardTitle className="text-3xl font-headline text-primary">
              {user.displayName || (user.isAnonymous ? 'Guest Profile' : 'My Profile')}
            </CardTitle>
            {user.email && !user.isAnonymous && (
              <CardDescription className="text-lg font-body text-foreground/80 pt-1">
                {user.email}
              </CardDescription>
            )}
             {user.isAnonymous && (
              <CardDescription className="text-md font-body text-muted-foreground pt-1 italic">
                You are currently browsing as a guest.
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="pt-6 space-y-4 bg-card rounded-b-lg">
            <Button variant="outline" asChild className="w-full justify-between py-6 text-lg hover:bg-accent/50 group transition-all duration-150 ease-in-out hover:shadow-md border-border/70">
              <Link href="/history" className="flex items-center">
                <div className="flex items-center">
                  <ListCollapse className="mr-3 h-6 w-6 text-primary/80 group-hover:text-primary transition-colors" />
                  View Recommendation History
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>

            <Button variant="outline" asChild className="w-full justify-between py-6 text-lg hover:bg-accent/50 group transition-all duration-150 ease-in-out hover:shadow-md border-border/70">
              <Link href="/my-reviews" className="flex items-center">
                <div className="flex items-center">
                  <MessageSquareText className="mr-3 h-6 w-6 text-primary/80 group-hover:text-primary transition-colors" />
                  View My Content Reviews
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>

            <Button variant="outline" asChild className="w-full justify-between py-6 text-lg hover:bg-accent/50 group transition-all duration-150 ease-in-out hover:shadow-md border-border/70">
              <Link href="/watched-content" className="flex items-center">
                <div className="flex items-center">
                  <Eye className="mr-3 h-6 w-6 text-primary/80 group-hover:text-primary transition-colors" />
                  View Watched Content
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            
            <Button variant="destructive" onClick={logout} className="w-full justify-start py-6 text-lg mt-6 group transition-all duration-150 ease-in-out hover:shadow-md">
                <LogOut className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                Log Out
            </Button>
          </CardContent>
        </Card>

        {/* Removed the "Recently Viewed Content" Card that was here */}

      </main>
      <footer className="w-full py-6 mt-auto border-t border-border">
        <p className="text-center text-sm text-muted-foreground font-body">
          &copy; {new Date().getFullYear()} Rasika. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
