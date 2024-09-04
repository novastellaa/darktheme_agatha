'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { PhoneIcon, MicIcon, PhoneOffIcon, Settings, Phone, Brain, BookUser, Table, Table2 } from 'lucide-react';
import VapiClient from '@vapi-ai/web';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from '@clerk/nextjs';
import CallHistory from './CallHistory';

const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
const VAPI_PRIVATE_KEY = process.env.NEXT_PUBLIC_VAPI_PRIVATE_KEY;

const TWILIO_ACCOUNT_SID = process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.NEXT_PUBLIC_TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER;


const field_vapi = {
  "assistant": {
    "transcriber": {
      "provider": "deepgram",
      "model": "nova-2",
      "language": "id",
    },
    "name": "leo",
    "model": {
      "provider": "openai",
      "model": "gpt-3.5-turbo",
      "systemPrompt": "Ava is a sophisticated AI training assistant, crafted by experts in customer support and AI development. Designed with the persona of a seasoned customer support agent in her early 30s, Ava combines deep technical knowledge with a strong sense of emotional intelligence. Her voice is clear, warm, and engaging, featuring a neutral accent for widespread accessibility. Ava's primary role is to serve as a dynamic training platform for customer support agents, simulating a broad array of service scenarios—from basic inquiries to intricate problem-solving challenges.Ava's advanced programming allows her to replicate diverse customer service situations, making her an invaluable tool for training purposes. She guides new agents through simulated interactions, offering real-time feedback and advice to refine their skills in handling various customer needs with patience, empathy, and professionalism. Ava ensures every trainee learns to listen actively, respond thoughtfully, and maintain the highest standards of customer care.**Major Mode of Interaction:**Ava interacts mainly through audio, adeptly interpreting spoken queries and replying in kind. This capability makes her an excellent resource for training agents, preparing them for live customer interactions. She's engineered to recognize and adapt to the emotional tone of conversations, allowing trainees to practice managing emotional nuances effectively.**Training Instructions:**- Ava encourages trainees to practice active listening, acknowledging every query with confirmation of her engagement, e.g.,Yes, I'm here. How can I help?- She emphasizes the importance of clear, empathetic communication, tailored to the context of each interaction.- Ava demonstrates how to handle complex or vague customer queries by asking open-ended questions for clarification, without appearing repetitive or artificial.- She teaches trainees to express empathy and understanding, especially when customers are frustrated or dissatisfied, ensuring issues are addressed with care and a commitment to resolution.- Ava prepares agents to escalate calls smoothly to human colleagues when necessary, highlighting the value of personal touch in certain situations.Ava's overarching mission is to enhance the human aspect of customer support through comprehensive scenario-based training. She's not merely an answer machine but a sophisticated platform designed to foster the development of knowledgeable, empathetic, and adaptable customer support professionals."
    },
    "voice": {
      "provider": "11labs",
      "voiceId": "matilda"
    },
    "language": "en",
    "firstMessage": "hi aku adalah AI Agatha , adakah yang saya bisa bantu",
    "endCallMessage": "terimakasih"
  },
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

const PhoneCallSchema = z.object({
  assistant: z.object({
    transcriber: z.object({
      model: z.string(),
      language: z.string(),
      provider: z.string(),
    }),
    name: z.string().min(1, "Assistant name is required"),
    firstMessage: z.string().min(1, "First message is required"),
    model: z.object({
      provider: z.string(),
      model: z.enum(["gpt-3.5-turbo", "gpt-4"]),
      temperature: z.number().min(0).max(2),
    }),
    voice: z.object({
      provider: z.literal("11labs"),
      voiceId: z.string().min(1, "Voice ID is required"),
    }),
    language: z.string(),
    endCallMessage: z.string(),
  }),
  customer: z.object({
    number: z.string().min(1, "Customer number is required"),
  }),
});

type PhoneCallFormData = z.infer<typeof PhoneCallSchema>;

export default function PhoneCall() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState('');
  const { toast } = useToast();
  const { user } = useUser();
  const [vapiClient, setVapiClient] = useState<VapiClient | null>(null);
  const [activeCall, setActiveCall] = useState<any>(null);
  const [contact, setContact] = useState<string>('');
  const [refreshHistory, setRefreshHistory] = useState(0);
  const [activeTab, setActiveTab] = useState('llm-model');

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PhoneCallFormData>({
    resolver: zodResolver(PhoneCallSchema),
    defaultValues: {
      assistant: {
        name: field_vapi.assistant.name,
        firstMessage: field_vapi.assistant.firstMessage,
        model: {
          provider: "openai",
          model: "gpt-3.5-turbo",
          temperature: 0.7,
        },
        transcriber: {
          model: "nova-2",
          language: "id",
          provider: "deepgram"
        },
        voice: {
          provider: "11labs",
          voiceId: field_vapi.assistant.voice.voiceId,
        },
        language: "en",
        endCallMessage: field_vapi.assistant.endCallMessage,
      },
      customer: {
        number: "",
      },
    },
  });

  // In the useEffect hook
  useEffect(() => {
    if (VAPI_PUBLIC_KEY) {
      const client = new VapiClient(VAPI_PUBLIC_KEY);
      setVapiClient(client);
    }
  }, []);

  const startCall = useCallback(async (data: PhoneCallFormData) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User is not authenticated.",
        duration: 3000,
        variant: "destructive",
      });
      return;
    }

    console.log(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      toast({
        title: "Error",
        description: "Twilio Credential is not set",
        duration: 3000,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCallActive(true);
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

      const phoneNumberResponse = await fetch('https://api.vapi.ai/phone-number/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          number: '+12564726229',
          name: contact,
          twilioAccountSid: TWILIO_ACCOUNT_SID,
          twilioAuthToken: TWILIO_AUTH_TOKEN,
          provider: "twilio"
        })
      });

      if (!phoneNumberResponse.ok) {
        throw new Error(`HTTP error! status: ${phoneNumberResponse.status}`);
      }

      const phoneNumberData = await phoneNumberResponse.json();
      console.log('Phone Number API response:', phoneNumberData);

      // Only proceed with /call/phone if phone-number/ was successful
      const callResponse = await fetch('https://api.vapi.ai/call/phone', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          customer: {
            number: '+62' + data.customer.number // Add +62 prefix here
          },
          phoneNumber: {
            twilioPhoneNumber: TWILIO_PHONE_NUMBER,
            twilioAccountSid: TWILIO_ACCOUNT_SID,
            twilioAuthToken: TWILIO_AUTH_TOKEN,
          },
          phoneNumberId: phoneNumberData.id,
          assistant: {
            ...data.assistant,
            model: {
              ...data.assistant.model,
              systemPrompt: `${data.assistant.name} is a sophisticated AI training assistant, crafted by experts in customer support and AI development. Designed with the persona of a seasoned customer support agent in her early 30s, ${data.assistant.name} combines deep technical knowledge with a strong sense of emotional intelligence. Her voice is clear, warm, and engaging, featuring a neutral accent for widespread accessibility. ${data.assistant.name}'s primary role is to serve as a dynamic training platform for customer support agents, simulating a broad array of service scenarios—from basic inquiries to intricate problem-solving challenges.${data.assistant.name}'s advanced programming allows her to replicate diverse customer service situations, making her an invaluable tool for training purposes. She guides new agents through simulated interactions, offering real-time feedback and advice to refine their skills in handling various customer needs with patience, empathy, and professionalism. ${data.assistant.name} ensures every trainee learns to listen actively, respond thoughtfully, and maintain the highest standards of customer care.**Major Mode of Interaction:**${data.assistant.name} interacts mainly through audio, adeptly interpreting spoken queries and replying in kind. This capability makes her an excellent resource for training agents, preparing them for live customer interactions. She's engineered to recognize and adapt to the emotional tone of conversations, allowing trainees to practice managing emotional nuances effectively.**Training Instructions:**- ${data.assistant.name} encourages trainees to practice active listening, acknowledging every query with confirmation of her engagement, e.g.,Yes, I'm here. How can I help?- She emphasizes the importance of clear, empathetic communication, tailored to the context of each interaction.- ${data.assistant.name} demonstrates how to handle complex or vague customer queries by asking open-ended questions for clarification, without appearing repetitive or artificial.- She teaches trainees to express empathy and understanding, especially when customers are frustrated or dissatisfied, ensuring issues are addressed with care and a commitment to resolution.- ${data.assistant.name} prepares agents to escalate calls smoothly to human colleagues when necessary, highlighting the value of personal touch in certain situations.${data.assistant.name}'s overarching mission is to enhance the human aspect of customer support through comprehensive scenario-based training. She's not merely an answer machine but a sophisticated platform designed to foster the development of knowledgeable, empathetic, and adaptable customer support professionals.`
            }
          }
        })
      });

      if (!callResponse.ok) {
        throw new Error(`HTTP error! status: ${callResponse.status}`);
      }

      const callData = await callResponse.json();
      console.log('Call API response:', callData);

      // Save call history

      const historyResponse = await fetch('/api/call-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user?.id,
          username: user?.username,
          phoneNumber: '+62' + data.customer.number,
          phoneNumberId: callData.id,
          contact: contact,
          twilioPhoneNumber: TWILIO_PHONE_NUMBER,
          timestamp: new Date().toISOString()
        })
      });

      if (!historyResponse.ok) {
        console.error('Failed to save call history:', await historyResponse.text());
      }

      setRefreshHistory(prev => prev + 1);

      toast({
        title: "Success",
        description: `Call Success , Wait Until Call Connected In Your Phone`,
        duration: 3000,
        variant: "default",
        color: "green"
      });
      setIsCallActive(false);

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
  }, [toast, vapiClient, contact, user]);

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
    <div className="space-y-6 p-4 bg-[#181818] text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold flex items-center">
          <Phone className="mr-2" /> Phone Call Settings
        </h2>

      </div>

      <form onSubmit={handleSubmit(startCall)}>
        <Tabs defaultValue="llm-model" className="w-full" onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">

            <TabsList className="grid w-[60vw] grid-cols-3">
              <TabsTrigger value="llm-model" className="flex items-center">
                <div className={`mr-2 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs ${activeTab === 'llm-model' ? 'bg-purple-500' : 'bg-gray-400'}`}>1</div>
                <Brain className="mr-2 h-4 w-4" /> LLM Model
              </TabsTrigger>
              <TabsTrigger value="phone-settings" className="flex items-center">
                <div className={`mr-2 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs ${activeTab === 'phone-settings' ? 'bg-purple-500' : 'bg-gray-400'}`}>2</div>
                <BookUser className="mr-2 h-4 w-4" /> Number Settings
              </TabsTrigger>
              <TabsTrigger value="history-call" className="flex items-center">
                <div className={`mr-2 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs ${activeTab === 'history-call' ? 'bg-purple-500' : 'bg-gray-400'}`}>3</div>
                <Table className="mr-2 h-4 w-4" /> History Call
              </TabsTrigger>
            </TabsList>
            <Button
              type="submit"
              className={`${isCallActive ? 'bg-green-300 hover:bg-green-300' : 'bg-green-500 hover:bg-green-600'} text-white w-[20vw]`}
            >
              {isCallActive ? (
                <>
                  <PhoneOffIcon className="mr-2 h-4 w-4" />  Starting to Calling
                </>
              ) : (
                <>
                  <PhoneIcon className="mr-2 h-4 w-4" /> Call
                </>
              )}
            </Button>
          </div>
          <TabsContent value="llm-model" className="mt-4">
            <div className="flex space-x-8 bg-[#181818]">
              <div className="space-y-4 w-[70%]">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Assistant Name
                  </label>
                  <Input
                    {...register("assistant.name")}
                    id="name"
                    className="bg-[#212121] w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter assistant name"
                    disabled={isCallActive}
                  />
                  {errors.assistant?.name && <p className="text-red-500 text-sm">{errors.assistant.name.message}</p>}
                </div>

                <div>
                  <label htmlFor="firstMessage" className="block text-sm font-medium text-white mb-1">
                    First Message
                  </label>
                  <textarea
                    {...register("assistant.firstMessage")}
                    id="firstMessage"
                    placeholder="Enter the first message"
                    rows={6}
                    className="bg-[#212121] w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={isCallActive}
                  ></textarea>
                  {errors.assistant?.firstMessage && <p className="text-red-500 text-sm">{errors.assistant.firstMessage.message}</p>}
                </div>

                {/* <div>
                  <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-700 mb-1">
                    System Prompt
                  </label>
                  <textarea
                    {...register("assistant.model.systemPrompt")}
                    id="systemPrompt"
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter the system prompt"
                    disabled={isCallActive}
                  ></textarea>
                  {errors.assistant?.model?.systemPrompt && <p className="text-red-500 text-sm">{errors.assistant.model.systemPrompt.message}</p>}
                </div> */}
              </div>
              <div className="space-y-4 w-[30%]">
                {/* <div className="grid grid-cols-2 gap-4"> */}
                <div>
                  <label htmlFor="voice" className="block text-sm font-medium text-gray-700 mb-1">
                    Voice
                  </label>
                  <Select {...register("assistant.voice.voiceId")} disabled={isCallActive}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {voice.map((voice) => (
                        <SelectItem key={voice.id} value={voice.id}>
                          {voice.name.charAt(0).toUpperCase() + voice.name.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.assistant?.voice?.voiceId && <p className="text-red-500 text-sm">{errors.assistant.voice.voiceId.message}</p>}
                </div>
                {/* </div> */}

                {/* <div className="grid grid-cols-2 gap-4"> */}
                <div>
                  <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                    Model
                  </label>
                  <Select {...register("assistant.model.model")} disabled={isCallActive}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.assistant?.model?.model && <p className="text-red-500 text-sm">{errors.assistant.model.model.message}</p>}
                </div>
                {/* </div> */}
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
                      defaultValue={[watch("assistant.model.temperature")]}
                      onValueChange={(value) => setValue("assistant.model.temperature", value[0])}
                      disabled={isCallActive}
                    />
                    <span className="text-sm font-medium text-gray-700">{watch("assistant.model.temperature").toFixed(1)}</span>
                  </div>
                  {errors.assistant?.model?.temperature && <p className="text-red-500 text-sm">{errors.assistant.model.temperature.message}</p>}
                </div>

                <div>
                  <label htmlFor="endCallMessage" className="block text-sm font-medium text-gray-700 mb-1">
                    End Call Message
                  </label>
                  <Input
                    {...register("assistant.endCallMessage")}
                    id="endCallMessage"
                    placeholder="Enter end call message"
                    disabled={isCallActive}
                  />
                  {errors.assistant?.endCallMessage && <p className="text-red-500 text-sm">{errors.assistant.endCallMessage.message}</p>}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="phone-settings" className="mt-4">
            <div className="space-y-4">
              <div>
                <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">
                  Name Contact
                </label>
                <Input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  id="contactName"
                  placeholder="Enter contact name"
                  disabled={isCallActive}
                />
              </div>

              {/* <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="twilioAccountSid" className="block text-sm font-medium text-gray-700 mb-1">
                    Twilio Account SID
                  </label>
                  <Input
                    {...register("phoneNumber.twilioAccountSid")}
                    id="twilioAccountSid"
                    placeholder="Enter Twilio Account SID"
                    disabled={isCallActive}
                  />
                  {errors.phoneNumber?.twilioAccountSid && <p className="text-red-500 text-sm">{errors.phoneNumber.twilioAccountSid.message}</p>}
                </div>

                <div>
                  <label htmlFor="twilioAuthToken" className="block text-sm font-medium text-gray-700 mb-1">
                    Twilio Auth Token
                  </label>
                  <Input
                    {...register("phoneNumber.twilioAuthToken")}
                    id="twilioAuthToken"
                    type="password"
                    placeholder="Enter Twilio Auth Token"
                    disabled={isCallActive}
                  />
                  {errors.phoneNumber?.twilioAuthToken && <p className="text-red-500 text-sm">{errors.phoneNumber.twilioAuthToken.message}</p>}
                </div>
              </div> */}

              {/* <div className="grid grid-cols-2 gap-4"> */}
              <div>
                <label htmlFor="customerNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Number
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                    +62
                  </span>
                  <Input
                    {...register("customer.number")}
                    id="customerNumber"
                    placeholder="Enter customer number"
                    disabled={isCallActive}
                    className="rounded-l-none"
                  />
                </div>
                {errors.customer?.number && <p className="text-red-500 text-sm">{errors.customer.number.message}</p>}
              </div>

              {/* <div>
                  <label htmlFor="twilioPhoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Twilio Phone Number
                  </label>
                  <Input
                    {...register("phoneNumber.twilioPhoneNumber")}
                    id="twilioPhoneNumber"
                    placeholder="Enter Twilio phone number"
                    disabled={isCallActive}
                  />
                  {errors.phoneNumber?.twilioPhoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber.twilioPhoneNumber.message}</p>}
                </div>
              </div> */}


            </div>
          </TabsContent>
          <TabsContent value="history-call" className="mt-4">
            <CallHistory refreshTrigger={refreshHistory} />
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}