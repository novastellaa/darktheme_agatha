import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { PencilIcon, TrashIcon } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

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

type PromptListDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    prompts: Prompt[];
    defaultPrompt: Prompt;
    onPromptClick: (prompt: Prompt) => void;
    onEditPrompt: (prompt: Prompt) => void;
    onDeletePrompt: (prompt: Prompt) => void;
    onSetDefaultPrompt: (prompt: Prompt) => void;
    currentPrompt: Prompt | null;
    isLoading: boolean;
};

export default function PromptListDialog({
    isOpen,
    onClose,
    prompts,
    defaultPrompt,
    onPromptClick,
    onEditPrompt,
    onDeletePrompt,
    onSetDefaultPrompt,
    isLoading,
    currentPrompt
}: PromptListDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[725px] h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Available Prompts</DialogTitle>
                    <DialogDescription>
                        Browse and select from our collection of pre-defined prompts.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-grow pr-4">
                    <div className="grid gap-4 py-4 md:grid-cols-2">
                        {isLoading ? (
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
                                    onClick={() => onPromptClick(defaultPrompt)}
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
                                {prompts.map((prompt) => (
                                    <Card
                                        key={prompt.id}
                                        className={`relative cursor-pointer ${currentPrompt?.id === prompt.id ? 'bg-blue-50' : ''}`}
                                        onClick={() => onPromptClick(prompt)}
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