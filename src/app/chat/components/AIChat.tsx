'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useChat } from 'ai/react'
import Sidebar from './Sidebar'
import ChatArea from './ChatArea'
import PromptList from './PromptList';
import { useUser } from '@clerk/nextjs'


export default function AIChat() {
    const [chatHistory, setChatHistory] = useState<{ id: string; title: string; messages: any[]; timestamp: number; prompt: string }[]>([])
    const [currentChatId, setCurrentChatId] = useState<string | null>(null)
    const [model, setModel] = useState<'gpt-3.5-turbo' | 'gpt-3.5-turbo-16k'>('gpt-3.5-turbo')
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [prompt, setPrompt] = useState<string>('You are a helpful AI assistant. Answer the user\'s questions to the best of your ability.')

    // const [chatHistory, setChatHistory] = useState([])
    // const [model, setModel] = useState<'gpt-3.5-turbo' | 'gpt-3.5-turbo-16k'>('gpt-3.5-turbo')
    // const [prompt, setPrompt] = useState('')
    const [temperature, setTemperature] = useState(0.5)
    const [topP, setTopP] = useState(1)
    const [presencePenalty, setPresencePenalty] = useState(0)
    const [frequencyPenalty, setFrequencyPenalty] = useState(0)
    const [maxTokens, setMaxTokens] = useState(2048)
    const [title, setTitle] = useState<string>('')
    const [currentPrompt2, setCurrentPrompt2] = useState<any | null>(null);
    const [isPromptListVisible, setIsPromptListVisible] = useState(true);
    const { user } = useUser();

    const handlePromptClick = (prompt: any) => {
        setCurrentPrompt(prompt);
        setPrompt(prompt.prompt);
        setCurrentTitle(prompt.title);
        setTemperature(prompt.temperature);
        setTopP(prompt.topP);
        setPresencePenalty(prompt.presencePenalty);
        setFrequencyPenalty(prompt.frequencyPenalty);
        setMaxTokens(prompt.maxTokens);
        startNewChat();
    };

    const { messages, input, handleSubmit, isLoading, reload, setMessages, setInput } = useChat({
        api: '/api/chat',
        id: currentChatId ?? undefined,
        body: {
            model,
            prompt,
            temperature,
            topP,
            presencePenalty,
            frequencyPenalty,
            maxTokens
        },
        onFinish: (message) => {
            // console.log("masuk", prompt);
            // console.log("model", model);
            // console.log("temperature", temperature);
            if (currentChatId) {
                setChatHistory(prev => prev.map(chat =>
                    chat.id === currentChatId
                        ? { ...chat, messages: [...chat.messages, message], title: chat.messages[0].content.slice(0, 30) }
                        : chat
                ))
            }
        }
    })


    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setInput('')
    }, [currentChatId])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    useEffect(() => {
        const fetchChatHistory = async () => {
            if (user) {
                try {
                    const response = await fetch(`/api/chat-history?userId=${user.id}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch chat history');
                    }
                    const data = await response.json();
                    setChatHistory(data);
                } catch (error) {
                    console.error('Error fetching chat history:', error);
                    // You might want to show a toast notification here
                }
            }
        };

        fetchChatHistory();
    }, [user]);

    const startNewChat = async () => {
        if (messages.length > 0) {
            const newChatHistory = {
                id: currentChatId || Date.now().toString(),
                title: messages[0].content.slice(0, 30),
                messages,
                timestamp: Date.now(),
                prompt,
                userId: user?.id || '',
                username: user?.username || ''
            };

            setChatHistory(prev => [...prev, newChatHistory]);

            try {
                const response = await fetch('/api/chat-history', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newChatHistory),
                });

                if (!response.ok) {
                    throw new Error('Failed to save chat history');
                }
            } catch (error) {
                console.error('Error saving chat history:', error);
                // You might want to show a toast notification here
            }
        }

        setMessages([]);
        setCurrentChatId(Date.now().toString());
    };

    const loadChat = (chatId: string) => {
        const chat = chatHistory.find(c => c.id === chatId)
        if (chat) {
            setCurrentChatId(chatId)
            setMessages(chat.messages)
            setInput('')
            setPrompt(chat.prompt)
        }
    }

    const handleInputChange = (value: string) => {
        setInput(value)
    }

    useEffect(() => {
        const handleResize = () => {
            setSidebarOpen(window.innerWidth > 768)
        }

        window.addEventListener('resize', handleResize)
        handleResize()

        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const [currentPrompt, setCurrentPrompt] = useState<any | null>(null);
    const [currentTitle, setCurrentTitle] = useState("Chat AI");

    const togglePromptList = () => setIsPromptListVisible(!isPromptListVisible);
    const [promptListKey, setPromptListKey] = useState(0);

    const onPromptSaved = useCallback(() => {
        setPromptListKey(prevKey => prevKey + 1);
    }, []);

    return (
        <>
            <div className="flex h-[85vh] m-1 ml-[2vw] mt-[3px]">
                <Sidebar
                    onPromptSaved={onPromptSaved}
                    chatHistory={chatHistory}
                    startNewChat={startNewChat}
                    loadChat={loadChat}
                    model={model}
                    setModel={setModel}
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    prompt={prompt}
                    setPrompt={setPrompt}
                    temperature={temperature}
                    setTemperature={setTemperature}
                    topP={topP}
                    setTopP={setTopP}
                    presencePenalty={presencePenalty}
                    setPresencePenalty={setPresencePenalty}
                    frequencyPenalty={frequencyPenalty}
                    setFrequencyPenalty={setFrequencyPenalty}
                    maxTokens={maxTokens}
                    setMaxTokens={setMaxTokens}
                    title={title}
                    setTitle={setTitle}
                    setCurrentPrompt={setCurrentPrompt}
                    setCurrentTitle={setCurrentTitle}
                />
                <div className="flex-1 flex gap-4">
                    <div className="flex-1">
                        <ChatArea
                            messages={messages}
                            input={input}
                            handleInputChange={handleInputChange}
                            handleSubmit={handleSubmit}
                            isLoading={isLoading}
                            messagesEndRef={messagesEndRef}
                            sidebarOpen={sidebarOpen}
                            setSidebarOpen={setSidebarOpen}
                            title={currentTitle}
                            isPromptListVisible={isPromptListVisible}
                            togglePromptList={togglePromptList}
                        />
                    </div>
                    {isPromptListVisible && (
                        <div className="w-80 text-white">
                            <PromptList
                                key={promptListKey}
                                onPromptClick={handlePromptClick}
                                currentPromptId={currentPrompt?.id || null}
                                onPromptSaved={onPromptSaved}
                            />
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}