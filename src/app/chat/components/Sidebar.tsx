'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ClockIcon, HashIcon, PlusIcon, XIcon, ChevronDownSquare, RectangleEllipsis, PencilIcon, TrashIcon, ListIcon, MoreVertical } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"
import Link from 'next/link'
import { UrlObject } from 'url'
import React from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRouter } from 'next/navigation';
import PromptListDialog from './PromptListDialog';
import PromptDialog from './PromptDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

type SidebarProps = {
    chatHistory: { id: string; title: string; messages: any[]; timestamp: number | string }[]
    startNewChat: () => void
    loadChat: (chatId: string) => void
    model: 'gpt-3.5-turbo' | 'gpt-3.5-turbo-16k'
    setModel: (model: 'gpt-3.5-turbo' | 'gpt-3.5-turbo-16k') => void
    isOpen: boolean
    onClose: () => void
    onPromptSaved: () => void;
    prompt: string
    title: string
    setTitle: (title: string) => void
    setPrompt: (prompt: string) => void
    temperature: number
    setTemperature: (temperature: number) => void
    topP: number
    setTopP: (topP: number) => void
    presencePenalty: number
    setPresencePenalty: (presencePenalty: number) => void
    frequencyPenalty: number
    setFrequencyPenalty: (frequencyPenalty: number) => void
    maxTokens: number
    setMaxTokens: (maxTokens: number) => void
    setCurrentPrompt: (prompt: Prompt) => void
    setCurrentTitle: (title: string) => void
}

type Prompt = {
    id: string;
    title: string;
    prompt: string;
    temperature: number;
    topP: number;
    presencePenalty: number;
    frequencyPenalty: number;
    maxTokens: number;
}

const DEFAULT_PROMPT: Prompt = {
    id: 'default',
    title: 'Chat AI',
    prompt: 'You are a helpful AI assistant. Answer the user\'s questions to the best of your ability.',
    temperature: 0.2,
    topP: 1,
    presencePenalty: 0,
    frequencyPenalty: 0,
    maxTokens: 2048,
};

export default function Sidebar({
    chatHistory,
    startNewChat,
    loadChat,
    model,
    setModel,
    isOpen,
    onClose,
    onPromptSaved,
    prompt,
    setPrompt,
    temperature,
    setTemperature,
    topP,
    setTopP,
    presencePenalty,
    setPresencePenalty,
    frequencyPenalty,
    setFrequencyPenalty,
    maxTokens,
    setMaxTokens,
    setTitle,
    title,
    setCurrentPrompt,
    setCurrentTitle
}: SidebarProps) {
    const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false);
    const [tempPrompt, setTempPrompt] = useState(prompt);
    const [tempTitle, setTempTitle] = useState(title);
    const [tempTemperature, setTempTemperature] = useState(temperature ?? 0.7);
    const [tempTopP, setTempTopP] = useState(topP ?? 1);
    const [tempPresencePenalty, setTempPresencePenalty] = useState(presencePenalty ?? 0);
    const [tempFrequencyPenalty, setTempFrequencyPenalty] = useState(frequencyPenalty ?? 0);
    const [tempMaxTokens, setTempMaxTokens] = useState(maxTokens ?? 2048);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const [isPromptListDialogOpen, setIsPromptListDialogOpen] = useState(false);
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [promptToDelete, setPromptToDelete] = useState<Prompt | null>(null);
    const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
    const router = useRouter();
    const [defaultPrompt, setDefaultPrompt] = useState<Prompt>(DEFAULT_PROMPT);
    const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);
    const [currentPrompt , setiCurrentPrompt] = useState<Prompt | null>(null);

    useEffect(() => {
        setTempPrompt(prompt);
        setTempTitle(tempTitle);
        setTempTemperature(temperature ?? 0);
        setTempTopP(topP ?? 0.9);
        setTempPresencePenalty(presencePenalty ?? 0.6);
        setTempFrequencyPenalty(frequencyPenalty ?? 0.6);
        setTempMaxTokens(maxTokens ?? 3048);
    }, [prompt, temperature, topP, presencePenalty, frequencyPenalty, maxTokens, title]);

    const handlePromptSubmit = async () => {
        setIsLoading(true);
        try {
            let result;
            if (editingPrompt) {
                // Edit existing prompt
                const response = await fetch(`/api/prompts/${editingPrompt.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id: editingPrompt.id,
                        title: tempTitle,
                        prompt: tempPrompt,
                        temperature: tempTemperature,
                        topP: tempTopP,
                        presencePenalty: tempPresencePenalty,
                        frequencyPenalty: tempFrequencyPenalty,
                        maxTokens: tempMaxTokens,
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to update prompt settings');
                }

                result = await response.json();
            } else {
                // Create new prompt (existing logic)
                const response = await fetch('/api/chat/settings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title: tempTitle,
                        prompt: tempPrompt,
                        temperature: tempTemperature,
                        topP: tempTopP,
                        presencePenalty: tempPresencePenalty,
                        frequencyPenalty: tempFrequencyPenalty,
                        maxTokens: tempMaxTokens,
                    }),
                });
                if (!response.ok) {
                    throw new Error('Failed to save chat settings');
                }
                result = await response.json();
            }

            console.log('Chat settings saved:', result);

            setPrompt(tempPrompt);
            setTitle(tempTitle);
            setTemperature(tempTemperature);
            setTopP(tempTopP);
            setPresencePenalty(tempPresencePenalty);
            setFrequencyPenalty(tempFrequencyPenalty);
            setMaxTokens(tempMaxTokens);
            setIsPromptDialogOpen(false);
            setEditingPrompt(null);

            toast({
                title: "Success",
                description: `Your chat settings have been successfully ${editingPrompt ? 'updated' : 'saved'}.`,
                duration: 3000,
                className: "bg-green-100 border-green-400 text-green-700",
            });

            // Refresh the prompts list
            fetchPrompts();
        } catch (error: any) {
            console.error('Error saving chat settings:', error);
            toast({
                title: "Error",
                description: error.message || `Failed to ${editingPrompt ? 'update' : 'save'} chat settings. Please try again.`,
                duration: 3000,
                variant: "destructive",
                className: "bg-red-100 border-red-400 text-red-700",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (timestamp: number | string) => {
        const date = new Date(timestamp);
        return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
    }

    const fetchPrompts = async () => {
        setIsLoadingPrompts(true);
        try {
            const response = await fetch('/api/prompts');
            if (!response.ok) {
                throw new Error('Failed to fetch prompts');
            }
            const data = await response.json();
            setPrompts(data);
            setIsLoadingPrompts(false);

        } catch (error) {
            console.error('Error fetching prompts:', error);
            toast({
                title: "Error",
                description: "Failed to fetch prompts. Please try again.",
                duration: 3000,
                variant: "destructive",
            });
        }
        setIsLoadingPrompts(false);
    }


    useEffect(() => {
        if (isPromptListDialogOpen) {
            fetchPrompts();
        }
    }, [isPromptListDialogOpen]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.shiftKey && event.key === 'Enter') {
                event.preventDefault();
                handleStartNewChat();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const handleEditPrompt = (prompt: Prompt) => {
        console.log("prompt -> ", prompt);
        setEditingPrompt(prompt);
        setTempTitle(prompt.title);
        setTempPrompt(prompt.prompt);
        setTempTemperature(prompt.temperature);
        setTempTopP(prompt.topP);
        setTempPresencePenalty(prompt.presencePenalty);
        setTempFrequencyPenalty(prompt.frequencyPenalty);
        setTempMaxTokens(prompt.maxTokens);
        setIsPromptListDialogOpen(false);
        setIsPromptDialogOpen(true);
    };

    const handleDeletePrompt = async (prompt: Prompt) => {
        setPromptToDelete(prompt);
    };

    const confirmDelete = async () => {
        if (!promptToDelete) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/prompts/${promptToDelete.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete prompt');
            }

            toast({
                title: "Success",
                description: "Prompt has been successfully deleted.",
                duration: 3000,
                className: "bg-green-100 border-green-400 text-green-700",
            });

            // Refresh the prompts list
            fetchPrompts();
        } catch (error: any) {
            console.error('Error deleting prompt:', error);
            toast({
                title: "Error",
                description: error.message || "Failed to delete prompt. Please try again.",
                duration: 3000,
                variant: "destructive",
                className: "bg-red-100 border-red-400 text-red-700",
            });
        } finally {
            setIsLoading(false);
            setPromptToDelete(null);
        }
    };

    const handleSetDefaultPrompt = (prompt: Prompt) => {
        setDefaultPrompt(prompt);
        toast({
            title: "Default Prompt Set",
            description: `"${prompt.title}" is now the default prompt for new chats.`,
            duration: 3000,
        });
    };

    const handlePromptCardClick = (prompt: Prompt) => {
        if (prompt.id === 'default') {
            console.log("handleSetDefaultPrompt -> ", prompt);
            setCurrentPrompt(prompt);
            setCurrentTitle(prompt.title);
            setPrompt(prompt.prompt);
            setTemperature(prompt.temperature);
            setTopP(prompt.topP);
            setPresencePenalty(prompt.presencePenalty);
            setFrequencyPenalty(prompt.frequencyPenalty);
            setMaxTokens(prompt.maxTokens);
            startNewChat();
        } else {
            setCurrentPrompt(prompt);
            setCurrentTitle(prompt.title);
            setPrompt(prompt.prompt);
            setTemperature(prompt.temperature);
            setTopP(prompt.topP);
            setPresencePenalty(prompt.presencePenalty);
            setFrequencyPenalty(prompt.frequencyPenalty);
            setMaxTokens(prompt.maxTokens);
            startNewChat(); // Add this line to start a new chat
            toast({
                title: prompt.title,
                description: `"${prompt.title}" is now the prompt for new chats.`,
                duration: 3000,
            });
        }
        setIsPromptListDialogOpen(false);
    };

    const handleStartNewChat = () => {
        setCurrentPrompt(defaultPrompt);
        setCurrentTitle(defaultPrompt.title);
        setPrompt(defaultPrompt.prompt);
        setTemperature(defaultPrompt.temperature);
        setTopP(defaultPrompt.topP);
        setPresencePenalty(defaultPrompt.presencePenalty);
        setFrequencyPenalty(defaultPrompt.frequencyPenalty);
        setMaxTokens(defaultPrompt.maxTokens);
        startNewChat();
    };

    const openNewPromptDialog = () => {
        setEditingPrompt(null);
        setTempTitle('');
        setTempPrompt('');
        setTempTemperature(0.7); // default value
        setTempTopP(1); // default value
        setTempPresencePenalty(0); // default value
        setTempFrequencyPenalty(0); // default value
        setTempMaxTokens(2048); // default value
        setIsPromptDialogOpen(true);
    };

    const handleClosePromptDialog = () => {
        setIsPromptDialogOpen(false);
        setEditingPrompt(null);
        setTempTitle('');
    };

    return (
        <>
            <aside className={`fixed inset-y-0 left-0 z-0 w-64 bg-abu text-gray-800 p-4 flex flex-col rounded-lg mr-4 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
                <header className="border-gray-200 p-4 flex justify-between items-center">
                    <Button onClick={onClose} variant="ghost" className="md:hidden">
                        <XIcon className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center space-x-2 w-full">
                        <Button
                            onClick={handleStartNewChat}
                            className="flex-grow flex items-center justify-center bg-[#6c47ff]"
                        >
                            <PlusIcon className="mr-2 h-4 w-4" />
                            New Chat
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-10 w-10 p-0">
                                    <MoreVertical className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 bg-color-abu">
                                <DropdownMenuItem onClick={openNewPromptDialog}>
                                    <PlusIcon className="mr-2 h-4 w-4" />
                                    <span>Add New Prompt</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                    fetchPrompts();
                                    setIsPromptListDialogOpen(true);
                                }}>
                                    <ListIcon className="mr-2 h-4 w-4" />
                                    <span>List Prompts</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>
                <ScrollArea className="flex-grow p-4">
                    {chatHistory.map((chat) => (
                        <div key={chat.id} className="mb-2">
                            <Button
                                variant="ghost"
                                className="w-full justify-start mb-1 text-left text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => loadChat(chat.id)}
                            >
                                {chat.title}
                            </Button>
                            <div className="flex justify-between text-xs text-gray-500 px-2">
                                <span className="flex items-center">
                                    <ClockIcon className="mr-1 h-3 w-3" />
                                    {formatDate(chat.timestamp)}
                                </span>
                                <span className="flex items-center">
                                    <HashIcon className="mr-1 h-3 w-3" />
                                    {chat.id.slice(0, 8)}
                                </span>
                            </div>
                        </div>
                    ))}
                </ScrollArea>
                {/* <div className="mt-auto p-4 border-t border-gray-200">
                    <Button
                        onClick={() => setModel('gpt-3.5-turbo')}
                        variant={model === 'gpt-3.5-turbo' ? 'secondary' : 'ghost'}
                        className="w-full mb-1 text-sm justify-start text-gray-700"
                    >
                        GPT-3.5-Turbo
                    </Button>
                    <Button
                        onClick={() => setModel('gpt-3.5-turbo-16k')}
                        variant={model === 'gpt-3.5-turbo-16k' ? 'secondary' : 'ghost'}
                        className="w-full text-sm justify-start text-gray-700"
                    >
                        GPT-3.5-Turbo-16k
                    </Button>
                </div> */}
            </aside>
            <PromptDialog
                onPromptSaved={onPromptSaved}
                isOpen={isPromptDialogOpen}
                onClose={handleClosePromptDialog}
                editingPrompt={editingPrompt}
                isLoading={isLoading}

            />
            <PromptListDialog
                isOpen={isPromptListDialogOpen}
                onClose={() => setIsPromptListDialogOpen(false)}
                prompts={prompts}
                defaultPrompt={DEFAULT_PROMPT}
                onPromptClick={handlePromptCardClick}
                onEditPrompt={handleEditPrompt}
                onDeletePrompt={handleDeletePrompt}
                onSetDefaultPrompt={handleSetDefaultPrompt}
                isLoading={isLoadingPrompts}
                currentPrompt={currentPrompt}

            />


        </>
    )
}

const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a"> & { onClick?: () => void, href?: string | UrlObject }
>(({ className, title, children, onClick, href, ...props }, ref) => {

    const content = (
        <div
            className={cn(
                "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                className
            )}
        >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                {children}
            </p>
        </div>
    )

    if (onClick) {
        return (
            <li>
                <button onClick={onClick} className="w-full text-left">
                    {content}
                </button>
            </li>
        )
    }

    return (
        <li>
            <NavigationMenuLink asChild>
                <Link href={href || '#'} ref={ref} {...props}>
                    {content}
                </Link>
            </NavigationMenuLink>
        </li>
    )
})
ListItem.displayName = "ListItem"