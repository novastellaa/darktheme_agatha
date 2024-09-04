import React, { useState, useEffect, useRef } from 'react';
import { Node } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, ScrollText, Upload } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useToast } from "@/components/ui/use-toast";

interface NodeData extends Record<string, unknown> {
    label: string;
    pdfFile?: File;
    fileName?: string;

}

interface NodeInfoCardKnowledgeRetrievalProps {
    node: Node<NodeData> | null;
    onClose: () => void;
    onUpdateNode: (id: string, data: Partial<NodeData>) => void;
    onLoadingChange: (isLoading: boolean) => void;
}

const NodeInfoCardKnowledgeRetrieval: React.FC<NodeInfoCardKnowledgeRetrievalProps> = ({ node, onClose, onUpdateNode, onLoadingChange }) => {
    const [title, setTitle] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [description, setDescription] = useState('');
    const { user } = useUser();

    const { toast } = useToast();


    useEffect(() => {
        if (node) {
            setTitle(node.data.label || '');
            console.log('node.data.file', node.data , typeof node.data.pdfFile);
            if (node.data.pdfFile instanceof File) {
                setFileName(node.data.fileName);
                setFile(node.data.pdfFile);
            }
            setDescription(node.data.description as string || node.data.nodeType as string);

        }
    }, [node]);

    useEffect(() => {
        onLoadingChange(isLoading);
    }, [isLoading, onLoadingChange]);

    if (!node) return null;
    let formData = new FormData();


    const fetchUpserrt = async () => {
        setIsLoading(true);
        if (file && user) {
            formData.append("files", file);
            formData.append("legacyBuild", 'true')
            formData.append("pineconeIndex", `flowise-ai-${user.username}`)
            onUpdateNode(node.id, {
                label: title,
                pdfFile: file,
                fileName: fileName,
                description: description,
            });
        }
        
        console.log('[file]', file!.type);
        if (file && file.type === 'text/csv') {
            console.log('CSV file detected. Skipping upsert operation.');
            toast({
                title: "Success",
                description: "CSV file processed successfully.",
                duration: 5000,
                className: "bg-green-100 border-green-400 text-green-700",
            });
            setIsLoading(false);
            onClose();
            return;
        }
        
        try {
            const response = await fetch('https://flowiseai-railway-production-9629.up.railway.app/api/v1/vector/upsert/52ff5341-453e-48b5-a243-fe203b7c65fa', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Network response was not ok: ${response.status} ${response.statusText}. Error: ${errorText}`);
            }

            const data = await response.json();
            console.log('API Response:', data);
            toast({
                title: "Success",
                description: "File uploaded successfully.",
                duration: 5000,
                className: "bg-green-100 border-green-400 text-green-700",
            });
            setIsLoading(false);
            onClose();
            return data;
        } catch (error) {
            console.error('Error in fetchUpserrt:', error);
            return null;
        }
    };

    const handleSave = async () => {
        if (!fileName || !user) {
            alert('Please upload a file before saving.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/chat-ratelimit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, type: 'flow' }),
            });
            const { success } = await response.json();

            if (!success) {
                toast({
                    title: "Rate Limit Exceeded",
                    description: "You have reached your request limit for the day.",
                    duration: 5000,
                    variant: "destructive",
                });
                return;
            }

            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64File = e.target?.result as string;
                const response = await fetch('/api/save-file', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        fileName,
                        userId: user.id,
                        file: base64File,
                        userName: user.username
                    }),
                });
                if (!response.ok) {
                    throw new Error('Failed to save file data');
                }
                await fetchUpserrt();
             

            };
            reader.readAsDataURL(file!);

        } catch (error) {
            console.error('Error in handleSave:', error);
            toast({
                title: "Error",
                description: "An error occurred while saving.",
                duration: 5000,
                variant: "destructive",
            });
            setIsLoading(false);
        } finally {
        }
    };
    const handleFileUpload = (uploadedFile: File) => {
        const allowedTypes = ['application/pdf', 'text/csv', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (allowedTypes.includes(uploadedFile.type)) {
            setFile(uploadedFile);
            setFileName(uploadedFile.name);
        } else {
            alert('Please upload a PDF, CSV, or DOCX file');
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        handleFileUpload(droppedFile);
    };

    const handleClose = () => {
        if (!isLoading) {
            onClose();
        }
    };

    return (
        <div className="bg-[#181818] absolute right-4 top-20 w-full sm:w-96  shadow-xl rounded-lg border border-gray-200 flex flex-col max-h-[calc(100vh-6rem)]">
            <div className="p-3 sm:p-4 flex items-center justify-between">
                <div className="flex items-center">
                    <div className="bg-[#ff47bf] rounded-full p-1 mr-2">
                        <ScrollText className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 mr-2 whitespace-nowrap">Knowledge Document</h3>
                </div>
                <button
                    onClick={handleClose}
                    className={`text-gray-400 hover:text-gray-600 ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
                    disabled={isLoading}
                >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div className="px-4 sm:px-6 pb-4 space-y-3 sm:space-y-4 overflow-y-auto flex-grow h-[40vh] sm:h-[49vh]">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <Input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full"
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
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-3 sm:p-4 text-center cursor-pointer h-[25vh] sm:h-[30vh] flex flex-wrap justify-center items-center ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                        }`}
                >
                    <input
                        type="file"
                        accept=".pdf,.csv,.docx"
                        onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                        className="hidden"
                        ref={fileInputRef}
                    />
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-1 text-sm text-gray-600">
                        Drag and drop your file here, or click to select
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        Supported formats: PDF, CSV , DOCX
                    </p>
                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-[#5726D1] mt-2"
                        variant="outline"
                    >
                        Upload Document
                    </Button>
                </div>
                {fileName && <p className="mt-2 text-xs sm:text-sm text-gray-600 font-bold">Selected file: {fileName}</p>}            </div>
            <div className="p-4 sm:p-6 pt-3 sm:pt-4 border-t border-gray-200">
                <Button
                    onClick={handleSave}
                    className="w-full bg-[#6c47ff] flex items-center justify-center text-sm sm:text-base"
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

export default NodeInfoCardKnowledgeRetrieval;