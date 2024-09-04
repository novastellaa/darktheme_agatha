import React, { useState, useEffect } from 'react';
import { Node } from '@xyflow/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface NodeData extends Record<string, unknown> {
    label: string;
    nodeType?: string;
    topic?: string;
    prompt?: string;
    model?: string;
    temperature?: number;
    topP?: number;
    presencePenalty?: number;
    frequencyPenalty?: number;
    maxTokens?: number;
}

interface NodeInfoCardProps {
    node: Node<NodeData> | null;
    onClose: () => void;
    onUpdateNode: (id: string, data: Partial<NodeData>) => void;
}

const NodeInfoCard: React.FC<NodeInfoCardProps> = ({ node, onClose, onUpdateNode }) => {
    const [title, setTitle] = useState('');
    const [topic, setTopic] = useState('');
    const [prompt, setPrompt] = useState('');
    const [model, setModel] = useState('gpt-3.5-turbo');
    const [temperature, setTemperature] = useState(0.7);
    const [topP, setTopP] = useState(1.0);
    const [presencePenalty, setPresencePenalty] = useState(0);
    const [frequencyPenalty, setFrequencyPenalty] = useState(0);
    const [maxTokens, setMaxTokens] = useState(2048);
    const [description, setDescription] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        if (node) {
            setTitle(node.data.label);
            setTopic(node.data.topic ?? '');
            setPrompt(node.data.prompt ?? '');
            setModel(node.data.model ?? 'gpt-3.5-turbo');
            setTemperature(node.data.temperature ?? 0.7);
            setTopP(node.data.topP ?? 1.0);
            setPresencePenalty(node.data.presencePenalty ?? 0);
            setFrequencyPenalty(node.data.frequencyPenalty ?? 0);
            setMaxTokens(node.data.maxTokens ?? 2048);
            setDescription(node.data.description as string || node.data.nodeType as string);
        }
    }, [node]);

    if (!node) return null;

    const handleSave = () => {
        onUpdateNode(node.id, {
            label: title,
            topic,
            prompt,
            model,
            temperature,
            topP,
            presencePenalty,
            frequencyPenalty,
            maxTokens,
            description: description
        });
        toast({
            title: "Success",
            description: "Node updated successfully.",
            duration: 5000,
            className: "bg-green-100 border-green-400 text-green-700",
        });
        onClose();
    };

    return (
        <div className="bg-[#181818] absolute right-4 top-20 w-96 bg-white shadow-xl rounded-lg border border-gray-200 flex flex-col max-h-[calc(100vh-6rem)]">
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                    <div className="bg-purple-500 rounded-full p-1 mr-2">
                        <Brain className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mr-2">Set Prompt AI</h3>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div className="px-6 pb-4 space-y-6 overflow-y-auto flex-grow">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-[#212121] w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="bg-[#212121] w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    />
                </div>
                {node.data.nodeType === 'LLM With Custom Prompt' ? (
                    <>
                        {/* <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                            />
                        </div> */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Prompt</label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="bg-[#212121] w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                                rows={4}
                            />
                        </div>
                    </>
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                        <Select value={model} onValueChange={setModel}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a model" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                                <SelectItem value="gpt-3.5-turbo-16k">GPT-3.5 Turbo 16k</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
                {/* Other input fields for temperature, topP, presencePenalty, frequencyPenalty, maxTokens */}
            </div>
            <div className="p-6 pt-4 border-t border-gray-200">
                <Button
                    onClick={handleSave}
                    className="w-full bg-[#6c47ff] flex items-center justify-center"
                >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                </Button>
            </div>
        </div>
    );
};

export default NodeInfoCard;