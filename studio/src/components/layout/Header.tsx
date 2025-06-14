// src/components/layout/Header.tsx
'use client';

import { LogIn, LogOut, UserCircle, User } from 'lucide-react'; 
import { ThemeToggleButton } from '@/components/theme/theme-toggle-button';
import { useAuth } from '@/lib/firebase/AuthContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from 'next/image';

export function Header() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="w-full py-6 mb-8 border-b border-border">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
          <Image
            src="/rasika-logo.png" 
            alt="Rasika Logo"
            width={144} 
 height={168}
 className="h-24 w-24 mr-2 mix-blend-multiply dark:mix-blend-normal"
            priority 
          />
          <h1 className="text-4xl font-headline text-primary">Rasika</h1>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggleButton />
          {loading ? (
            <Skeleton className="h-10 w-24" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 p-1.5 rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  {user.photoURL ? (
                     <Image
                        src={user.photoURL}
                        alt={user.displayName || 'User avatar'}
                        width={32}
                        height={32}
                        className="rounded-full" 
                      />
                  ) : (
                    <UserCircle className="h-8 w-8 text-foreground/70" />
                  )}
                   <span className="sr-only">Open user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.displayName || (user.isAnonymous ? 'Guest User' : 'User')}
                    </p>
                    {user.email && (
                       <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                     {user.isAnonymous && !user.email && (
                       <p className="text-xs leading-none text-muted-foreground">
                        Anonymous Session
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" /> 
                    <span>My Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="outline">
              <Link href="/login">
                <LogIn className="mr-2 h-5 w-5" />
                Login
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
