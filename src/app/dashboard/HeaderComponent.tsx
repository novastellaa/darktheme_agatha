'use client'

import React, { useEffect, useState } from 'react';
import Link from "next/link"
import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Home, MessageSquare, PanelLeft, Search, User, Users2, X } from "lucide-react"
import { useClerk } from "@clerk/nextjs";


interface HeaderComponentProps {
  currentUser: any;
  onLogout: () => void;
  currentView: 'users' | 'chat' | 'email' | 'product' | 'novel' | 'flow' | 'aiphone' | 'chat-flowise' | 'chat-new';
  onViewChange: (view: 'users' | 'chat' | 'email' | 'product' | 'novel' | 'flow' | 'aiphone' | 'chat-flowise' | 'chat-new') => void;
}

export function HeaderComponent({ currentUser, onLogout, currentView, onViewChange }: HeaderComponentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { signOut } = useClerk();

  const handleSignOut = () => {
    signOut();
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleViewChange = (view: 'users' | 'chat' | 'email' | 'product' | 'novel' | 'flow' | 'aiphone' | 'chat-new') => {
    onViewChange(view);
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 bg-gray px-4 shadow-sm sm:px-6">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button size="icon" variant="ghost" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:max-w-none">
          <SheetHeader className="pb-4 mb-4">
            <SheetTitle className="text-white text-lg font-semibold">Menu</SheetTitle>
          </SheetHeader>
          <nav className="space-y-4" aria-label="Main Navigation">
            {['users', 'chat', 'email', 'product', 'novel', 'flow'].map((view) => (
              <Link
                key={view}
                href="#"
                onClick={() => handleViewChange(view as 'users' | 'chat' | 'email' | 'product' | 'novel' | 'flow' | 'aiphone' | 'chat-new')}
                className={`flex items-center gap-3 px-2 py-2 rounded-md transition-colors ${currentView === view
                  ? 'bg-gray-100 text-gray-9000'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                {view === 'users' ? <Users2 className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
                {view.charAt(0).toUpperCase() + view.slice(1) }
              </Link>
            ))}
          </nav>
          <Button onClick={() => setIsOpen(false)} className="absolute top-4 right-4">
            <X className="h-4 w-4" />
          </Button>
        </SheetContent>
      </Sheet>

      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="#" onClick={() => onViewChange('users')} className="text-white hover:text-white">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {/* {currentView === 'chat' && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="#" onClick={() => onViewChange('chat')} className="text-gray-600 hover:text-gray-900">
                    Chat
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )} */}
          {currentView === 'chat' && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="#" onClick={() => onViewChange('chat-new')} className="text-white hover:text-white">
                    Chat
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          {currentView === 'email' && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="#" onClick={() => onViewChange('email')} className="text-white hover:text-white">
                    Email
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          {currentView === 'product' && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="#" onClick={() => onViewChange('product')} className="text-white hover:text-white">
                    Product
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          {currentView === 'novel' && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="#" onClick={() => onViewChange('novel')} className="text-white hover:text-white">
                    Novel
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          {currentView === 'flow' && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="#" onClick={() => onViewChange('flow')} className="text-white hover:text-white">
                    Flow
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
           {currentView === 'aiphone' && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="#" onClick={() => onViewChange('aiphone')} className="text-white hover:text-white">
                    AI Phone
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="relative ml-auto flex-1 md:max-w-xs">
        <Search  className="absolute hidden left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full hidden rounded-full bg-gray-100 pl-10 pr-4 focus:bg-white focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        {isClient && (
          <>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton />
            </SignedOut>
          </>
        )}
      </div>

    </header>
  )
}