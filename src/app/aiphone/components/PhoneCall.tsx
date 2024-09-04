'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { PhoneIcon, MicIcon, PhoneOffIcon, Settings, Phone } from 'lucide-react';
import VapiClient from '@vapi-ai/web';
import { useUser } from '@clerk/nextjs';

const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
const VAPI_PRIVATE_KEY = process.env.NEXT_PUBLIC_VAPI_PRIVATE_KEY;

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


export default function PhoneCall() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState('');
  const { toast } = useToast();
  const { user } = useUser();
  const [vapiClient, setVapiClient] = useState<VapiClient | null>(null);
  const [temperature, setTemperature] = useState(0.7);
  const [voiceId, setVoiceId] = useState("21m00Tcm4TlvDq8ikWAM");
  const [model, setModel] = useState("gpt-3.5-turbo");
  const [language, setLanguage] = useState("en-US");
  const [callHistory, setCallHistory] = useState<{ number: string; date: string; duration: string }[]>([
    { number: "+1234567890", date: "2023-05-01 14:30", duration: "5m 23s" },
    { number: "+9876543210", date: "2023-05-02 10:15", duration: "3m 45s" },
    { number: "+1122334455", date: "2023-05-03 16:45", duration: "8m 12s" },
    { number: "+5544332211", date: "2023-05-04 09:00", duration: "2m 56s" },
    { number: "+6677889900", date: "2023-05-05 13:20", duration: "6m 39s" },
  ]);
  const [activeCall, setActiveCall] = useState<any>(null);
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

  const [knowledgeBase, setKnowledgeBase] = useState<File | null>(null);
  const [knowledgeBaseName, setKnowledgeBaseName] = useState<string>('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setKnowledgeBase(file);
      setKnowledgeBaseName(file.name);
    }
  };
  // In the useEffect hook
  useEffect(() => {
    if (VAPI_PUBLIC_KEY) {
      const client = new VapiClient(VAPI_PUBLIC_KEY);
      setVapiClient(client);
    }
  }, []);


  const startCall = useCallback(async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User is not authenticated.",
        duration: 3000,
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/chat-ratelimit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, type: 'aiphone' }),
      });
      const { success } = await response.json();

      if (!success) {
        toast({
          title: "Rate Limit Exceeded",
          description: "You have reached your daily call limit. Please try again later.",
          duration: 3000,
          variant: "destructive",
        });
        return;
      }

      if (!vapiClient) {
        toast({
          title: "Error",
          description: "Vapi client is not initialized.",
          duration: 3000,
          variant: "destructive",
        });
        return;
      }

      setIsCallActive(true);
      setCallStatus('Calling...');
      toast({ title: "Calling Start", description: "Please wait a moment", className: "bg-green-100 border-green-400 text-green-700" });
      console.log('GET PARAMS', defaultCall);

      let callOptions: any = {
        model: {
          provider: defaultCall.model.provider,
          model: defaultCall.model.model,
          temperature: defaultCall.model.temperature,
          messages: [
            {
              role: defaultCall.model.messages[0].role,
              content: defaultCall.model.messages[0].content,
            },
          ],
        },
        voice: {
          provider: "11labs",
          voiceId: defaultCall.voice.voiceId,
        },
      };



      const call = await vapiClient.start({
        "firstMessage": defaultCall.firstMessage,
        "transcriber": {
          "model": "nova-2",
          "language": "id",
          "provider": "deepgram"
        },
        "model": {
          "provider": defaultCall.model.provider,
          "model": defaultCall.model.model,
          messages: [
            {
              role: defaultCall.model.messages[0].role,
              content: defaultCall.model.messages[0].content,
            },
          ],
          // "systemPrompt": "",
          "temperature": defaultCall.model.temperature,
          knowledgeBase: {
            provider: "canonical",
            topK: 2,
            fileIds: [
              "f1ebb3de-6d14-4e1d-8cee-0ea143ea2c46"
            ]
          }
        },
        "voice": {
          "provider": "11labs",
          "voiceId": defaultCall.voice.voiceId
        },
        // "language": "en",
        "endCallMessage": "terimakasih"

      });
      setActiveCall(call);
      // vapiClient.on('call-start', () => setCallStatus('Ringing...'));
      // vapiClient.on('speech-start', () => setCallStatus('Connected'));
      // vapiClient.on('call-end', () => {
      //   setCallStatus('Call ended');
      //   setIsCallActive(false);
      // });


      vapiClient.on('call-start', () => {
        toast({ title: "Call Status", description: "Ringing...", className: "bg-green-100 border-green-400 text-green-700" });
      });
      vapiClient.on('speech-start', () => toast({ title: "Call Status", description: "Connected", className: "bg-green-100 border-green-400 text-green-700" }));
      vapiClient.on('call-end', () => {
        toast({ title: "Call Status", description: "Call ended", className: "bg-red-100 border-red-400 text-red-700" });
        setIsCallActive(false);
      });

      setCallHistory(prev => [...prev, { number: phoneNumber, date: new Date().toLocaleString(), duration: '0:00' }]);

    } catch (error) {
      console.error('Error starting call:', error);
      toast({
        title: "Error",
        description: `Failed to start the call: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: 3000,
        variant: "destructive",
      });
      setIsCallActive(false);
    }
  }, [toast, vapiClient, defaultCall, phoneNumber, knowledgeBase, user]);

  const endCall = useCallback(() => {
    if (vapiClient) {
      vapiClient.stop();
    }
    // if (activeCall) {
    //   activeCall.hangUp();
    // }
    setActiveCall(null);
    setIsCallActive(false);
    setCallStatus('Call ended');
  }, [vapiClient, activeCall]);

  return (
    <div className="flex justify-center items-start space-x-8 p-2">
      {/* Left Card: AI Phone Settings */}
      <div className="bg-[#181818] text-white rounded-lg shadow-lg p-6 w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold flex items-center">
            <Phone className="mr-2" /> AI Phone Assistant
          </h2>
          <Button
            onClick={isCallActive ? endCall : () => startCall()}
            className={`${isCallActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white w-[14vw]`}
          >
            {isCallActive ? (
              <>
                <PhoneOffIcon className="mr-2 h-4 w-4" /> Disconnect
              </>
            ) : (
              <>
                <PhoneIcon className="mr-2 h-4 w-4" /> Call
              </>
            )}
          </Button>
        </div>
        <div className='flex'>
          <div className="w-[64vw] mr-[1vw]">
            {/* <div className="mb-4">
              <label htmlFor="knowledgeBase" className="block text-sm font-medium text-gray-700 mb-1">
                Knowledge Base
              </label>
              <input
                type="file"
                id="knowledgeBase"
                onChange={handleFileUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                disabled={isCallActive}
              />
              {knowledgeBaseName && (
                <p className="mt-1 text-sm text-gray-500">Selected file: {knowledgeBaseName}</p>
              )}
            </div> */}
            <div className="mb-4">
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
                disabled={isCallActive}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-700 mb-1">
                System Prompt
              </label>
              <textarea
                value={defaultCall.model.messages[0].content}
                onChange={(e) => setDefaultCall({ ...defaultCall, model: { ...defaultCall.model, messages: [{ ...defaultCall.model.messages[0], content: e.target.value }] } })}
                id="systemPrompt"
                rows={4}
                className="bg-[#212121] w-full px-3 h-[50vh] max-h-[50vh] py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter the system prompt"
                disabled={isCallActive}
              ></textarea>
            </div>
          </div>
          <div className="w-[15vw]">
            <div className="mb-4">
              <label htmlFor="voice" className="block text-sm font-medium text-gray-700 mb-1">
                Voice
              </label>
              <Select value={defaultCall.voice.voiceId} onValueChange={(value) => setDefaultCall({ ...defaultCall, voice: { ...defaultCall.voice, voiceId: value } })} disabled={isCallActive}>
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
              <Select value={defaultCall.model.messages[0].role} onValueChange={(value) => setDefaultCall({ ...defaultCall, model: { ...defaultCall.model, messages: [{ ...defaultCall.model.messages[0], role: value }] } })} disabled={isCallActive}>
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
              <Select value={defaultCall.model.provider} onValueChange={(value) => setDefaultCall({ ...defaultCall, model: { ...defaultCall.model, provider: value } })} disabled={isCallActive}>
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
              <Select value={defaultCall.model.model} onValueChange={(value) => setDefaultCall({ ...defaultCall, model: { ...defaultCall.model, model: value } })} disabled={isCallActive}>
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
                  disabled={isCallActive}
                />
                <span className="text-sm font-medium text-gray-700">{temperature.toFixed(1)}</span>
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
                disabled={isCallActive}
              />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}