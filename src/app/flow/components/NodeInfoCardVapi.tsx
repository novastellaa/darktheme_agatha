import React, { useState, useEffect } from 'react';
import { Node } from '@xyflow/react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Phone, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface NodeData extends Record<string, unknown> {
    label: string;
    model?: string;
    temperature?: number;
    topP?: number;
    presencePenalty?: number;
    frequencyPenalty?: number;
    maxTokens?: number;
}

interface NodeInfoCardVapiProps {
    node: Node<NodeData> | null;
    onClose: () => void;
    onUpdateNode: (id: string, data: Partial<NodeData>) => void;
}


const voice = [
    {
      id: "bVMeCyTHy58xNoL34h3p",
      name: "Jeremy",
    },
    {
      id: "SOYHLrjzK2X1ezoPC6cr",
      name: "Harry",
    },
    {
      id: "jBpfuIE2acCO8z3wKNLl",
      name: "Gigi",
    },
    {
      id: "pNInz6obpgDQGcFmaJgB",
      name: "Adam",
    },
    {
      id: "TxGEqnHWrfWFTfGW9XjX",
      name: "Josh",
    },
    {
      id: "FGY2WhTYpPnrIDTdsKH5",
      name: "Laura",
    },
    {
      id: "sarah",
      name: "Sarah",
    },
  ]
  

const NodeInfoCardVapi: React.FC<NodeInfoCardVapiProps> = ({ node, onClose, onUpdateNode }) => {
    const [title, setTitle] = useState('');
    const [model, setModel] = useState('gpt-3.5-turbo');
    const [topP, setTopP] = useState(1.0);
    const [presencePenalty, setPresencePenalty] = useState(0);
    const [frequencyPenalty, setFrequencyPenalty] = useState(0);
    const [maxTokens, setMaxTokens] = useState(2048);
    const { toast } = useToast();
    const [defaultCall, setDefaultCall] = useState<any>({
        firstMessage: "Hai , this is agatha ai voice assistant, can I help you today?",
        model: {
            provider: "openai",
            model: "gpt-3.5-turbo",
            temperature: 0.7,
            messages: [
                {
                    role: "assistant",
                    content: "you is a sophisticated AI training assistant, crafted by experts in customer support . Designed with the persona of a seasoned customer support agent in her early 30s, you combines deep technical knowledge with a strong sense of emotional intelligence. Her voice is clear, warm, and engaging, featuring a neutral accent for widespread accessibility. you's primary role is to serve as a dynamic training platform for customer support agents, simulating a broad array of service scenarios—from basic inquiries to intricate problem-solving challenges.you's advanced programming allows her to replicate diverse customer service situations, making her an invaluable tool for training purposes. She guides new agents through simulated interactions, offering real-time feedback and advice to refine their skills in handling various customer needs with patience, empathy, and professionalism. you ensures every trainee learns to listen actively, respond thoughtfully, and maintain the highest standards of customer care.**Major Mode of Interaction:**you interacts mainly through audio, adeptly interpreting spoken queries and replying in kind. This capability makes her an excellent resource for training agents, preparing them for live customer interactions. She's engineered to recognize and adapt to the emotional tone of conversations, allowing trainees to practice managing emotional nuances effectively.**Training Instructions:**- you encourages trainees to practice active listening, acknowledging every query with confirmation of her engagement, e.g.,Yes, I'm here. How can I help?- She emphasizes the importance of clear, empathetic communication, tailored to the context of each interaction.- you demonstrates how to handle complex or vague customer queries by asking open-ended questions for clarification, without appearing repetitive or artificial.- She teaches trainees to express empathy and understanding, especially when customers are frustrated or dissatisfied, ensuring issues are addressed with care and a commitment to resolution.- you prepares agents to escalate calls smoothly to human colleagues when necessary, highlighting the value of personal touch in certain situations.you's overarching mission is to enhance the human aspect of customer support through comprehensive scenario-based training. She's not merely an answer machine but a sophisticated platform designed to foster the development of knowledgeable, empathetic, and adaptable customer support professionals.",//system prompt
                },
            ],
            maxTokens: 5,
        },
        voice: {
            provider: "11labs",
            voiceId: "bVMeCyTHy58xNoL34h3p",
        },
    });

    useEffect(() => {
        if (node) {
            setTitle(node.data.label);
        }
    }, [node]);

    if (!node) return null;

    const handleSave = () => {
        onUpdateNode(node.id, {
            label: title,
            setVapi :{...defaultCall},
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
        <div className="absolute right-4 top-20 w-96 bg-[#181818] shadow-xl rounded-lg border border-gray-200 flex flex-col max-h-[calc(100vh-6rem)]">
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                    <div className="bg-green-500 rounded-full p-1 mr-2">
                        <Phone className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mr-2">Setting  Telephone</h3>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div className="px-6 pb-4 space-y-2 overflow-y-auto flex-grow h-[49vh]">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-[#212121] w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    />
                </div>
                <div className="mb-1">
                    <label htmlFor="firstMessage" className="block text-sm font-medium text-gray-700 mb-1">
                        First Message
                    </label>
                    <input
                        value={defaultCall.firstMessage}
                        onChange={(e) => setDefaultCall({ ...defaultCall, firstMessage: e.target.value })}
                        type="text"
                        id="firstMessage"
                        className="bg-[#212121] w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter the first message"
                    />
                </div>

                <div className="mb-1">
                    <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-700 mb-1">
                        System Prompt
                    </label>
                    <textarea
                        value={defaultCall.model.messages[0].content}
                        onChange={(e) => setDefaultCall({ ...defaultCall, model: { ...defaultCall.model, messages: [{ ...defaultCall.model.messages[0], content: e.target.value }] } })}
                        id="systemPrompt"
                        rows={4}
                        className="bg-[#212121] w-full px-3  py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter the system prompt"
                    ></textarea>
                </div>
              
                <div className="mb-4">
                    <label htmlFor="voice" className="block text-sm font-medium text-gray-700 mb-1">
                        Voice
                    </label>
                    <Select value={defaultCall.voice.voiceId} onValueChange={(value) => setDefaultCall({ ...defaultCall, voice: { ...defaultCall.voice, voiceId: value } })} >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a voice" />
                        </SelectTrigger>
                        <SelectContent>
                            {voice.map((voice) => (
                                <SelectItem key={voice.id} value={voice.id}>
                                    {voice.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {/* <div className="mb-4">
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                    </label>
                    <Select value={defaultCall.model.messages[0].role} onValueChange={(value) => setDefaultCall({ ...defaultCall, model: { ...defaultCall.model, messages: [{ ...defaultCall.model.messages[0], role: value }] } })} >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                            {['assistant', 'function', 'user', 'system', 'tool'].map((role) => (
                                <SelectItem key={role} value={role}>
                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div> */}

                <div className="mb-4">
                    <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-1">
                        Provider
                    </label>
                    <Select value={defaultCall.model.provider} onValueChange={(value) => setDefaultCall({ ...defaultCall, model: { ...defaultCall.model, provider: value } })} >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a provider" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="openai">OpenAI</SelectItem>
                            <SelectItem value="anthropic">Anthropic</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="mb-4">
                    <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                        Model
                    </label>
                    <Select value={defaultCall.model.model} onValueChange={(value) => setDefaultCall({ ...defaultCall, model: { ...defaultCall.model, model: value } })} >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                            <SelectItem value="gpt-4">GPT-4</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="mb-4">
                    <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-1">
                        Temperature
                    </label>
                    <div className="flex items-center">
                        <Slider
                            id="temperature"
                            min={0}
                            max={2}
                            step={0.1}
                            className="w-full mr-4"
                            defaultValue={[defaultCall.model.temperature]}
                            onValueChange={(value) => setDefaultCall({ ...defaultCall, model: { ...defaultCall.model, temperature: value[0] } })}
                            
                        />
                           <span className="text-sm font-medium text-gray-700">
                        {defaultCall.model.temperature.toFixed(1)}
                    </span>
                    </div>
                </div>

                <div className="mb-4">
                    <label htmlFor="maxTokens" className="block text-sm font-medium text-gray-700 mb-1">
                        Max Tokens
                    </label>
                    <Input
                        value={defaultCall.model.maxTokens}
                        onChange={(e) => setDefaultCall({ ...defaultCall, model: { ...defaultCall.model, maxTokens: e.target.value } })}
                        type="number"
                        id="maxTokens"
                        placeholder="Enter max tokens"
                        className="w-full"
                        
                    />
                    
                </div>
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

export default NodeInfoCardVapi;