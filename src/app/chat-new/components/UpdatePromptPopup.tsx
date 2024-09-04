import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import { Slider } from "@/components/ui/slider";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from '@clerk/nextjs';


type Prompt = {
    id: string;
    title: string;
    prompt: string;
    model?: string;
    temperature?: number;
    topP?: number;
    presencePenalty?: number;
    frequencyPenalty?: number;
    maxTokens?: number;
};

type UpdatePromptPopupProps = {
    isOpen: boolean;
    onClose: () => void;
    prompt: Prompt | null;
    onUpdate: () => void;
};

export function UpdatePromptPopup({ isOpen, onClose, prompt, onUpdate }: UpdatePromptPopupProps) {
    const { toast } = useToast();
    const { user } = useUser();
    const [isLoading, setIsLoading] = useState(false);

    const [tempTitle, setTempTitle] = useState(prompt?.title || '');
    const [tempPrompt, setTempPrompt] = useState(prompt?.prompt || '');
    const [tempModel, setTempModel] = useState(prompt?.model || 'gpt-3.5-turbo');
    const [tempTemperature, setTempTemperature] = useState(prompt?.temperature || 0.5);
    const [tempTopP, setTempTopP] = useState(prompt?.topP || 1);
    const [tempPresencePenalty, setTempPresencePenalty] = useState(prompt?.presencePenalty || 0);
    const [tempFrequencyPenalty, setTempFrequencyPenalty] = useState(prompt?.frequencyPenalty || 0);
    const [tempMaxTokens, setTempMaxTokens] = useState(prompt?.maxTokens || 150);
    

    useEffect(() => {
        if (prompt) {
            setTempTitle(prompt.title);
            setTempPrompt(prompt.prompt);
            setTempModel(prompt.model || 'gpt-3.5-turbo');
            setTempTemperature(prompt.temperature || 0.5);
            setTempTopP(prompt.topP || 1);
            setTempPresencePenalty(prompt.presencePenalty || 0);
            setTempFrequencyPenalty(prompt.frequencyPenalty || 0);
            setTempMaxTokens(prompt.maxTokens || 150);
        }
    }, [prompt]);

    const updatePrompt = async () => {
        if (!prompt || !user) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/new-prompt/${prompt.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id,
                    username: user.username,
                    title: tempTitle,
                    prompt: tempPrompt,
                    model: tempModel,
                    temperature: tempTemperature,
                    topP: tempTopP,
                    maxTokens: tempMaxTokens,
                    presencePenalty: tempPresencePenalty,
                    frequencyPenalty: tempFrequencyPenalty,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update prompt');
            }

            toast({
                title: "Success",
                description: "Prompt updated successfully",
                variant: "default",
                duration: 3000,
                className: "bg-green-100 border-green-400 text-green-700",
            });
            onUpdate();
            onClose();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update prompt",
                variant: "destructive",
                duration: 3000,
                className: "bg-red-100 border-red-400 text-red-700",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                onClose();
            }
        }}>
            <DialogContent className="sm:max-w-[700px] max-h-[98vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        Edit Prompt
                    </DialogTitle>
                </DialogHeader>
                <Separator className="my-0" />
                <ScrollArea className="flex-grow pr-4">
                    <div className="grid gap-6 py-2 h-[50vh]">
                        <div className="space-y-1">
                            <Label htmlFor="prompt" className="text-sm font-medium">
                                Title <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="title"
                                value={tempTitle}
                                onChange={(e) => setTempTitle(e.target.value)}
                                placeholder="Enter a title for your prompt"
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="prompt" className="text-sm font-medium">
                                Prompt <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                id="prompt"
                                value={tempPrompt}
                                onChange={(e) => setTempPrompt(e.target.value)}
                                placeholder="Enter your custom prompt here"
                                className="h-32 w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="model" className="text-sm font-medium">Model</Label>
                            <Select value={tempModel} onValueChange={setTempModel}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a model" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="gpt-3.5-turbo">GPT-3.5-Turbo</SelectItem>
                                    <SelectItem value="gpt-3.5-turbo-16k">GPT-3.5-Turbo-16k</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <Card>
                                <CardContent className="p-4 space-y-4">
                                    <SliderSetting
                                        label="Temperature"
                                        value={tempTemperature}
                                        onChange={setTempTemperature}
                                        min={0}
                                        max={1}
                                        step={0.01}
                                    />
                                    <SliderSetting
                                        label="Top P"
                                        value={tempTopP}
                                        onChange={setTempTopP}
                                        min={0}
                                        max={1}
                                        step={0.01}
                                    />
                                    <SliderSetting
                                        label="Max Tokens"
                                        value={tempMaxTokens}
                                        onChange={setTempMaxTokens}
                                        min={1}
                                        max={4096}
                                        step={1}
                                    />
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4 space-y-4">
                                    <SliderSetting
                                        label="Presence Penalty"
                                        value={tempPresencePenalty}
                                        onChange={setTempPresencePenalty}
                                        min={0}
                                        max={2}
                                        step={0.01}
                                    />
                                    <SliderSetting
                                        label="Frequency Penalty"
                                        value={tempFrequencyPenalty}
                                        onChange={setTempFrequencyPenalty}
                                        min={0}
                                        max={2}
                                        step={0.01}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </ScrollArea>
                <Separator className="my-4" />
                <DialogFooter>
                    <Button
                        onClick={updatePrompt}
                        disabled={isLoading || !tempTitle.trim()}
                        className="w-full bg-[#6c47ff]"
                    >
                        {isLoading ? 'Updating...' : 'Update Prompt'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

type SliderSettingProps = {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step: number;
};

function SliderSetting({ label, value, onChange, min, max, step }: SliderSettingProps) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <Label htmlFor={label} className="text-sm font-medium">{label}</Label>
                <span className="text-sm text-gray-500">{value.toFixed(2)}</span>
            </div>
            <Slider
                id={label}
                min={min}
                max={max}
                step={step}
                value={[value]}
                onValueChange={(newValue) => onChange(newValue[0])}
                className="w-full"
            />
        </div>
    );
}