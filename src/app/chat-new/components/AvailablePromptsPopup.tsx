import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
type Prompt = {
    id: string;
    title: string;
    prompt: string;
    temperature: number;
    topP: number;
    presencePenalty: number;
    frequencyPenalty: number;
    maxTokens: number;
};

type AvailablePromptsPopupProps = {
    isOpen: boolean;
    onClose: () => void;
    onSelectPrompt: (prompt: Prompt) => void;
    defaultPrompt: Prompt;
    onSetDefaultPrompt: (prompt: Prompt) => void;
};

export function AvailablePromptsPopup({ isOpen, onClose, onSelectPrompt, defaultPrompt, onSetDefaultPrompt }: AvailablePromptsPopupProps) {
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchPrompts();
    }, []);

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



    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>Available Prompts</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">Browse and select from our collection of pre-defined prompts.</p>
                <ScrollArea className="h-[400px] pr-4">
                    <div className="grid gap-4 py-4 md:grid-cols-2">
                        {isLoadingPrompts ? (
                            // Skeleton loader
                            Array.from({ length: 6 }).map((_, index) => (
                                <Card key={index} className="relative">
                                    <CardHeader>
                                        <Skeleton className="h-6 w-3/4" />
                                    </CardHeader>
                                    <CardContent>
                                        <Skeleton className="h-4 w-full mb-2" />
                                        <Skeleton className="h-4 w-2/3" />
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <>
                                <Card
                                    key={defaultPrompt.id}
                                    className="relative cursor-pointer bg-blue-50"
                                    onClick={() => onSelectPrompt(defaultPrompt)}
                                >
                                    <CardHeader>
                                        <CardTitle>{defaultPrompt.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription>{defaultPrompt.prompt.slice(0, 100)}...</CardDescription>
                                    </CardContent>
                                    <div className="absolute top-2 right-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSetDefaultPrompt(defaultPrompt);
                                            }}
                                        >
                                            Set as Default
                                        </Button>
                                    </div>
                                </Card>
                                {prompts.map((prompt: any) => (
                                    <Card
                                        key={prompt.id}
                                        className={`relative cursor-pointer `}
                                        onClick={() => onSelectPrompt(prompt)}
                                    >
                                        <CardHeader>
                                            <CardTitle>{prompt.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <CardDescription>{prompt.prompt.slice(0, 100)}...</CardDescription>
                                        </CardContent>
                                    </Card>
                                ))}
                            </>
                        )}
                    </div>
                    
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}