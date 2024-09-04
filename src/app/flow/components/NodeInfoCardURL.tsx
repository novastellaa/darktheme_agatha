import React, { useState, useEffect } from 'react';
import { Node } from '@xyflow/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Link, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';
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
    const [prompt, setPrompt] = useState('');
    const [url, setUrl] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const { user } = useUser();
    const { toast } = useToast();



    useEffect(() => {
        if (node) {
            setTitle(node.data.label);
            setUrl(node.data.url as string);
            setDescription(node.data.description as string || '' || node.data.nodeType as string);

        }
    }, [node]);

    if (!node) return null;

    const handleSave = async () => {
        setIsLoading(true);
        onUpdateNode(node.id, { 
            label: title,
            url: url,
            description: description,
        });
        try {
            await fetchUpserrt();
      
            onClose();
        } catch (error) {
            console.error('Error in fetchUpserrt:', error);
            // You can add a toast notification here to inform the user about the error
        } finally {
            setIsLoading(false);
            // toast({
            //     title: "Success",
            //     description: "Node updated successfully.",
            //     duration: 5000,
            //     className: "bg-green-100 border-green-400 text-green-700",
            // });
            onClose();
        }
    };
    let formData = new FormData();


    const fetchUpserrt = async () => { //upsertfile
        if ( !user) {return}
        try {
            const response = await fetch('https://flowiseai-railway-production-9629.up.railway.app/api/v1/vector/upsert/0dcc53e4-8a39-4782-8ec9-54fe26c675ba', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    overrideConfig: {
                        pineconeIndex: `flowise-ai-${user.username}`,
                        repoLink: url
                    },
         
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Network response was not ok: ${response.status} ${response.statusText}. Error: ${errorText}`);
            }

            const data = await response.json();
            toast({
                title: "Success",
                description: "Node updated successfully.",
                duration: 5000,
                className: "bg-green-100 border-green-400 text-green-700",
            });
            console.log('API Response:', data);
            return data;
        } catch (error) {
            console.error('Error in fetchUpserrt:', error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : 'An unknown error occurred',
                duration: 5000,
                className: "bg-red-100 border-red-400 text-red-700",
            });
            // Toast notification added to inform the user about the error
            return null;
        }
    };

    return (
        <div className="bg-[#181818] absolute right-4 top-20 w-96 bg-white shadow-xl rounded-lg border border-gray-200 flex flex-col max-h-[calc(100vh-6rem)]">
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                    <div className="bg-[#ff47bf] rounded-full p-1 mr-2">
                        <Link className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mr-2">Knowledge URLS</h3>
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

                <>
                    <div>
                        <div className='flex items-center'>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URLS</label>
                        <label className="block text-sm font-medium text-gray-500 ml-2  mb-1 italic">* from github</label>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="bg-[#212121] flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                            />
                          
                        </div>
                    </div>
                </>

            </div>
            <div className="p-6 pt-4 border-t border-gray-200">
                <Button
                    onClick={handleSave}
                    className="w-full bg-[#6c47ff] flex items-center justify-center"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                        </div>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Save
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};

export default NodeInfoCard;