import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useUser } from '@clerk/nextjs';
import { CalendarIcon, PencilIcon, TrashIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { DeleteConfirmationPopup } from './DeleteConfirmationPopup';
import { UpdatePromptPopup } from './UpdatePromptPopup';
import { SiOpenai } from "react-icons/si";


type Prompt = {
    id: string;
    title: string;
    prompt: string;
    createdAt: string;
    model: string;
};

type PromptListProps = {
    onPromptClick: (prompt: Prompt) => void;
    currentPromptId: string | null;
    onPromptSaved: () => void;
};

export default function PromptList({ onPromptClick, currentPromptId, onPromptSaved }: PromptListProps) {
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useUser();
    const { toast } = useToast();
    const [deletePromptId, setDeletePromptId] = useState<string | null>(null);
    const [deletePromptTitle, setDeletePromptTitle] = useState<string>('');
    const [updatePromptId, setUpdatePromptId] = useState<string | null>(null);
    const [updatePrompt, setUpdatePrompt] = useState<Prompt | null>(null);

    const fetchPrompts = async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/list-prompt?username=${user.username}`);
            if (!response.ok) {
                throw new Error('Failed to fetch prompts');
            }
            const data = await response.json();
            setPrompts(data);
        } catch (err) {
            setError('Failed to load prompts');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchPrompts();
        }
    }, [user, onPromptSaved]);


    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/new-prompt/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete prompt');
            }
            toast({
                title: "Success",
                description: "Prompt deleted successfully",
                duration: 3000,
                className: "bg-green-100 border-green-400 text-green-700",
            });
            fetchPrompts();
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to delete prompt",
                duration: 3000,
                variant: "destructive",
                className: "bg-red-100 border-red-400 text-red-700",
            });
        } finally {
            setDeletePromptId(null);
            setDeletePromptTitle('');
        }
    };

    const openDeleteConfirmation = (id: string, title: string) => {
        setDeletePromptId(id);
        setDeletePromptTitle(title);
    };

    const closeDeleteConfirmation = () => {
        setDeletePromptId(null);
        setDeletePromptTitle('');
    };

    return (
        <Card className="w-full h-full flex flex-col">
            <CardHeader className="border-b border-gray-200">
                <CardTitle>List of Prompts</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden p-4">
                <ScrollArea className="h-full">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    ) : error ? (
                        <p className="text-red-500 text-center">{error}</p>
                    ) : (
                        <div className="space-y-4">
                            {prompts.map((prompt) => (
                                <Card
                                    key={prompt.id}
                                    className={`cursor-pointer w-[18.5vw] transition-colors hover:bg-gray-100 ${currentPromptId === prompt.id ? 'bg-gray-100' : ''}`}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start border">
                                            <div onClick={() => onPromptClick(prompt)} className="w-[9vw]">
                                                <h3 className="font-semibold text-lg mb-2 text-light">{prompt.title}</h3>
                                                <p className="text-sm text-white mb-2 line-clamp-2 overflow-hidden text-ellipsis">{prompt.prompt}</p>
                                                <div className="flex items-center text-xs text-white space-x-2">
                                                    <div className="flex items-center">
                                                        <CalendarIcon className="w-3 h-3 mr-1" />
                                                        {new Date(prompt.createdAt).toLocaleDateString()}
                                                    </div>
                                                    {/* <div className="flex items-center">
                                                        <span className="bg-green-100 rounded-full p-1 mr-1">
                                                            <SiOpenai className="w-3 h-3 text-green-600" />
                                                        </span>
                                                        {prompt.model}
                                                    </div> */}
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="bg-purple-100 hover:bg-purple-200 text-purple-700"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setUpdatePromptId(prompt.id);
                                                        setUpdatePrompt(prompt);
                                                    }}
                                                >
                                                    <PencilIcon className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="bg-red-100 hover:bg-red-200 text-red-700"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openDeleteConfirmation(prompt.id, prompt.title);
                                                    }}
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
            <DeleteConfirmationPopup
                isOpen={!!deletePromptId}
                onClose={closeDeleteConfirmation}
                onConfirm={() => deletePromptId && handleDelete(deletePromptId)}
                promptTitle={deletePromptTitle}
            />
            <UpdatePromptPopup
                isOpen={!!updatePromptId}
                onClose={() => {
                    setUpdatePromptId(null);
                    setUpdatePrompt(null);
                }}
                prompt={updatePrompt}
                onUpdate={fetchPrompts}
            />
        </Card>
    );
}