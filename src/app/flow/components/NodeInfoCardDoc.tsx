import React, { useState, useEffect, useRef } from 'react';
import { Node } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Brain, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

interface NodeData extends Record<string, unknown> {
    label: string;
    chunkSize?: number;
    chunkOverlap?: number;
    topK?: number;
    pdfFile?: File;
    model?: string;
}

interface NodeInfoCardDocProps {
    node: Node<NodeData> | null;
    onClose: () => void;
    onUpdateNode: (id: string, data: Partial<NodeData>) => void;
}

const NodeInfoCardDoc: React.FC<NodeInfoCardDocProps> = ({ node, onClose, onUpdateNode }) => {
    const [title, setTitle] = useState('');
    const [chunkSize, setChunkSize] = useState(1000);
    const [chunkOverlap, setChunkOverlap] = useState(200);
    const [topK, setTopK] = useState(4);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [description, setDescription] = useState('');
    const [model, setModel] = useState('gpt-3.5-turbo');
    const { toast } = useToast();

    useEffect(() => {
        if (node) {
            setTitle(node.data.label || '');
            setChunkSize(node.data.chunkSize || 4000);
            setChunkOverlap(node.data.chunkOverlap || 1000);
            setTopK(node.data.topK || 4);
            setDescription(node.data.description as string || node.data.nodeType as string);
            setModel(node.data.model as string || 'gpt-3.5-turbo');
        }
    }, [node]);

    if (!node) return null;

    const handleSave = () => {
        onUpdateNode(node.id, {
          label: title,
          chunkSize,
          chunkOverlap,
          topK,
          description: description,
          model: model,
        });
        toast({
            title: "Success",
            description: "Node updated successfully.",
            duration: 5000,
            className: "bg-green-100 border-green-400 text-green-700",
        });
        onClose();
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
        } else {
            alert('Please upload a PDF file');
        }
    };

    return (
        <div className="bg-[#181818] absolute right-4 top-20 w-96 bg-white shadow-xl rounded-lg border border-gray-200 flex flex-col max-h-[calc(100vh-6rem)]">
          <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                    <div className="bg-purple-500 rounded-full p-1 mr-2">
                        <Brain className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mr-2">LLM By Knowledge</h3>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div className="px-6 pb-4 space-y-4 overflow-y-auto flex-grow h-[49vh]">
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
                
                {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chunk Size</label>
                    <Input
                        type="number"
                        value={chunkSize}
                        onChange={(e) => setChunkSize(Number(e.target.value))}
                        className="w-full"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chunk Overlap</label>
                    <Input
                        type="number"
                        value={chunkOverlap}
                        onChange={(e) => setChunkOverlap(Number(e.target.value))}
                        className="w-full"
                    />
                </div> */}
                {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Top K</label>
                    <Input
                        type="number"
                        value={topK}
                        onChange={(e) => setTopK(Number(e.target.value))}
                        className="w-full"
                    />
                </div> */}
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                    <Select value={model} onValueChange={setModel}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="gpt-3.5-turbo">gpt-3.5-turbo</SelectItem>
                            <SelectItem value="gpt-3.5-turbo-16k">gpt-3.5-turbo-16k</SelectItem>
                        </SelectContent>
                    </Select>
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

export default NodeInfoCardDoc;