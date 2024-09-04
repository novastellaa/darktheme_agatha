import React from 'react';
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
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useUser } from '@clerk/nextjs';


type PromptDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onPromptSaved: () => void;
};

export default function PromptDialog({
    isOpen,
    onClose,
    onPromptSaved,
}: Omit<PromptDialogProps, 'tempTitle' | 'setTempTitle' | 'tempPrompt' | 'setTempPrompt' | 'tempModel' | 'setTempModel' | 'tempTemperature' | 'setTempTemperature' | 'tempTopP' | 'setTempTopP' | 'tempPresencePenalty' | 'setTempPresencePenalty' | 'tempFrequencyPenalty' | 'setTempFrequencyPenalty' | 'tempMaxTokens' | 'setTempMaxTokens'>) {
    const { toast } = useToast();
    const { user } = useUser();

    const [tempTitle, setTempTitle] = useState( '');
    const [tempPrompt, setTempPrompt] = useState( '');
    const [tempModel, setTempModel] = useState( 'gpt-3.5-turbo');
    const [tempTemperature, setTempTemperature] = useState( 0.5);
    const [tempTopP, setTempTopP] = useState( 1);
    const [tempPresencePenalty, setTempPresencePenalty] = useState( 0);
    const [tempFrequencyPenalty, setTempFrequencyPenalty] = useState( 0);
    const [tempMaxTokens, setTempMaxTokens] = useState( 2048);
    const [isLoading, setIsLoading] = useState(false);



    const savePrompt = async (promptData: any) => {
        setIsLoading(true);
        const response = await fetch('/api/chat-api/prompts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(promptData),
        });

        if (!response.ok) {
            throw new Error('Failed to save prompt');
        }
        setIsLoading(false);
        return response.json();
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
                        { 'Custom Prompt and Settings'}
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
                        onClick={async () => {
                            if (!isLoading && tempTitle.trim()) {
                                try {
                                    await savePrompt({
                                        userId: user?.id || '', // Replace with actual user ID
                                        username: user?.username || '', // Replace with actual username
                                        title: tempTitle,
                                        prompt: tempPrompt,
                                        model: tempModel,
                                        temperature: tempTemperature,
                                        topP: tempTopP,
                                        maxTokens: tempMaxTokens,
                                        presencePenalty: tempPresencePenalty,
                                        frequencyPenalty: tempFrequencyPenalty,
                                    });

                                    toast({
                                        title: "Success",
                                        description: "Prompt saved successfully",
                                        variant: "default",
                                        duration: 3000,
                                        className: "bg-green-100 border-green-400 text-green-700",

                                    });
                                    onPromptSaved();
                                    onClose();
                                } catch (error) {
                                    toast({
                                        title: "Error",
                                        description: "Failed to save prompt",
                                        variant: "destructive",
                                        duration: 3000,
                                        className: "bg-red-100 border-red-400 text-red-700",
                                    });
                                }
                            }
                        }}
                        disabled={isLoading || !tempTitle.trim()}
                        className="w-full bg-[#6c47ff]"
                    >
                        {isLoading ? 'Saving...' : 'Set Prompt and Settings'}
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
                className="w-full "
            />
        </div>
    );
}