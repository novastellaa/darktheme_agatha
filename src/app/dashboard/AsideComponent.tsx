import React from 'react';
import Link from "next/link"
import Image from "next/image"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Home, LineChart, Package, Settings, Users2, MessageSquare, Mail, DollarSign, Pencil, Workflow, Phone, MessageCircle } from "lucide-react"

export function AsideComponent({ onViewChange, currentView }: { onViewChange: (view: 'users' | 'chat' | 'email' | 'product' | 'novel' | 'flow' | 'aiphone' | 'chat-flowise' | 'chat-new') => void, currentView: 'users' | 'chat' | 'email' | 'product' | 'novel' | 'flow' | 'aiphone' | 'chat-flowise' | 'chat-new' }) {
  return <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col bg-gray sm:flex border-b">
    <nav className="flex flex-col items-center gap-4 px-2 sm:py-4 border-line">
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href="#" className="flex h-9 w-9 items-center justify-center">
            <Image src="/Agatha_Icon.png" alt="Agatha Logo" width={24} height={24} />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">Agatha</TooltipContent>
      </Tooltip>

      <Link
        href="#"
        onClick={() => onViewChange('users')}
        className={`group hidden flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full ${currentView === 'users' ? 'bg-[#6c47ff] text-primary-foreground' : 'bg-background text-muted-foreground'} text-lg font-semibold md:h-8 md:w-8 md:text-base`}
      >
        <Home className="h-4 w-4 transition-all group-hover:scale-110" />
        <span className="sr-only">Users</span>
      </Link>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="#"
            onClick={() => onViewChange('chat')}
            className={`group  flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full ${currentView === 'chat' ? 'bg-[#6c47ff] text-primary-foreground' : 'bg-background text-muted-foreground'} text-lg font-semibold md:h-8 md:w-8 md:text-base`}
          >
            <MessageSquare className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">AI Chat</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">AI Chat</TooltipContent>
      </Tooltip>

      {/* <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="#"
            onClick={() => onViewChange('chat-new')}
            className={`group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full ${currentView === 'chat-new' ? 'bg-[#6c47ff] text-primary-foreground' : 'bg-background text-muted-foreground'} text-lg font-semibold md:h-8 md:w-8 md:text-base`}
          >
            <MessageSquare className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">AI Chat NEW</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">AI Chat NEW</TooltipContent>
      </Tooltip> */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="#"
            onClick={() => onViewChange('chat-flowise')}
            className={`group hidden h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full ${currentView === 'chat-flowise' ? 'bg-[#6c47ff] text-primary-foreground' : 'bg-background text-muted-foreground'} text-lg font-semibold md:h-8 md:w-8 md:text-base`}
          >
            <MessageCircle className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">AI Chat Flowise</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">AI Chat Flowise</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="#"
            onClick={() => onViewChange('email')}
            className={`group hidden h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full ${currentView === 'email' ? 'bg-[#6c47ff] text-primary-foreground' : 'bg-background text-muted-foreground'} text-lg font-semibold md:h-8 md:w-8 md:text-base`}
          >
            <Mail className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">Email</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">Email</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            // href="/product/316769"
            href="#"
            onClick={() => onViewChange('product')}
            className={`group hidden h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full ${currentView === 'product' ? 'bg-[#6c47ff] text-primary-foreground' : 'bg-background text-muted-foreground'} text-lg font-semibold md:h-8 md:w-8 md:text-base`}
          >
            <DollarSign className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">product</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">product</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="#"
            onClick={() => onViewChange('novel')}
            className={`group flex hidden h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full ${currentView === 'novel' ? 'bg-[#6c47ff] text-primary-foreground' : 'bg-background text-muted-foreground'} text-lg font-semibold md:h-8 md:w-8 md:text-base`}
          >
            <Pencil className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">Novel Text</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">Novel Text</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="#"
            onClick={() => onViewChange('flow')}
            className={`group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full ${currentView === 'flow' ? 'bg-[#6c47ff] text-primary-foreground' : 'bg-background text-muted-foreground'} text-lg font-semibold md:h-8 md:w-8 md:text-base`}
          >
            <Workflow className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">Flow</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">Flow</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="#"
            onClick={() => onViewChange('aiphone')}
            className={`group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full ${currentView === 'aiphone' ? 'bg-[#6c47ff] text-primary-foreground' : 'bg-background text-muted-foreground'} text-lg font-semibold md:h-8 md:w-8 md:text-base`}
          >
            <Phone className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">AI Phone</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">AI Phone</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="#"
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
          >
            <Users2 className="h-5 w-5" />
            <span className="sr-only">Customers</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">Customers</TooltipContent>
      </Tooltip>
      <Tooltip >
        <TooltipTrigger asChild>
          <Link
            href="#"
            className=" h-9 w-9 hidden items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
          >
            <LineChart className="h-5 w-5" />
            <span className="sr-only">Analytics</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">Analytics</TooltipContent>
      </Tooltip>
    </nav>
    <nav className="mt-auto flex-col items-center gap-4 px-2 sm:py-4 hidden">
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="#"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
          >
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">Settings</TooltipContent>
      </Tooltip>
    </nav>
  </aside>
}