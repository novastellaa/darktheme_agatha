'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge, Node, Edge, Connection, NodeTypes, EdgeTypes, BackgroundVariant, useReactFlow, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import NodeInfoCard from './components/NodeInfoCard';
import NodeInfoCardVapi from './components/NodeInfoCardVapi';
import CustomNode from './components/CustomNode';
import CustomEdge from './components/CustomEdge';
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import ChatDialog from './components/ChatDialog'; // Anda perlu membuat komponen ini
import { FileText, Play, Plus, Save, SaveAll, Trash2, Home, CheckSquare, Phone, Brain, Goal, FilePlus, ChevronRight, BookOpen, Link, ScrollText, FileSearch, Table, Loader2 } from 'lucide-react';
import { format } from 'date-fns/format';
import { Card, CardContent } from '@/components/ui/card';
import VapiClient from '@vapi-ai/web';
import NodeInfoCardDoc from './components/NodeInfoCardDoc';
import VapiPopup from './components/VapiPopup';
import NodeInfoCardKnowledgeRetrieval from './components/NodeInfoCardKnowledgeRetrieval';
import NodeInfoCardURL from './components/NodeInfoCardURL';
import { v4 as uuidv4 } from 'uuid';
import { User } from '@clerk/nextjs/server';
import { useHotkeys } from 'react-hotkeys-hook';
import DocumentViewPopup from './components/DocumentViewPopup';
import { checkRateLimit, logRateLimitedRequest } from '@/app/api/limit-rate/rateLimit';
import { useUser } from '@clerk/nextjs';

interface NodeData {
  label: string;
  setVapi: any;
  onUpdateLabel: (id: string, label: string) => void;
}

const nodeTypes: NodeTypes = {
  custom: CustomNode as unknown as NodeTypes['custom'],
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};


const VAPI_API_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

const initialNodes: Node[] = [];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
  // { id: 'e2-3', source: '2', target: '3', type: 'custom', animated: true },
];


export default function FlowComponentWrapper({ selectedFlowId, onFlowSaved, onFlowDeleted, user }: { selectedFlowId: string | null, onFlowSaved: (flow: any) => void, onFlowDeleted: () => void, user: any | null; }) {
  return (
    <ReactFlowProvider>
      <FlowComponent selectedFlowId={selectedFlowId} onFlowSaved={onFlowSaved} onFlowDeleted={onFlowDeleted} user={user} />
    </ReactFlowProvider>
  );
}

function FlowComponent({ selectedFlowId, onFlowSaved, onFlowDeleted }: { selectedFlowId: string | null, onFlowSaved: (flow: any) => void, onFlowDeleted: () => void, user: any | null; }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [currentFlowId, setCurrentFlowId] = useState<string | null>(null);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [flowName, setFlowName] = useState<string>("Untitled Flow");
  const [lastEditTime, setLastEditTime] = useState<Date | null>(null);
  const { getNodes, getViewport } = useReactFlow();
  const { toast } = useToast();
  const [defaultCall, setDefaultCall] = useState<any>({
    firstMessage: "Hai beb, can I help you today?",
    model: {
      provider: "openai",
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      messages: [
        {
          role: "assistant",
          content: "You are an assistant.",//system prompt
        },
      ],
      maxTokens: 5,
    },
    voice: {
      provider: "11labs",
      voiceId: "burt",
    },
  });
  const [vapiClient, setVapiClient] = useState<VapiClient | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<number | null>(null);
  const [showVapiPopup, setShowVapiPopup] = useState(false);
  const [isDocumentViewOpen, setIsDocumentViewOpen] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [isNodeInfoLoading, setIsNodeInfoLoading] = useState(false);
  const [isVapiCalling, setisVapiCalling] = useState(false)

  const { user } = useUser();

  const onViewDocument = useCallback(() => {
    setIsDocumentViewOpen(true);
  }, []);




  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );


  const loadFlow = useCallback(async (flowId: string) => {
    setSelectedNode(null);
    setShowChatDialog(false);
    try {
      setLoadingProgress(0);
      const response = await fetch(`/api/flows/${flowId}`);
      if (!response.ok) {
        throw new Error('Failed to load flow');
      }
      const flow = await response.json();

      // Simulate loading progress
      for (let i = 0; i <= 100; i += 10) {
        setLoadingProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100)); // Wait for 100ms
      }

      setNodes(flow.nodes);
      setEdges(flow.edges);
      setCurrentFlowId(flowId);
      setFlowName(flow.name || "Untitled Flow");
      setLastEditTime(new Date(flow.updatedAt || flow.createdAt));
      toast({
        title: "Success",
        description: `Flow "${flow.name}" loaded successfully`,
        className: "bg-green-100 border-green-400 text-green-700",
      });
    } catch (error) {
      console.error('Error loading flow:', error);
      toast({
        title: "Error",
        description: "Failed to load flow. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingProgress(null);
    }
  }, [setNodes, setEdges, toast]);


  useEffect(() => {
    // console.log("USERCLIEND", user);
    if (VAPI_API_KEY) {
      const client = new VapiClient(VAPI_API_KEY);
      setVapiClient(client);
    }
    if (selectedFlowId) {
      loadFlow(selectedFlowId);
    }
    if (!selectedFlowId) {
      setNodes([]);
      setEdges([]);
      setCurrentFlowId(null);
    }
 
  }, [selectedFlowId, loadFlow, onFlowDeleted, user]);

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/get-documents?userId=${user?.id}&limit=1`);
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      const data = await response.json();
      console.log("GET DATA DOCUMENT", data)
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to fetch documents. Please try again.",
        variant: "destructive",
      });
    }
  };


  const onUpdateNode = useCallback((id: string, data: Partial<NodeData>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, ...data } };
        }
        return node;
      })
    );
  }, [setNodes]);

  const onUpdateNodevapi = useCallback((id: string, data: Partial<NodeData>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, ...data } };
        }
        return node;
      })
    );
    if (data.setVapi) {
      setDefaultCall(data.setVapi);
    }
  }, [setNodes]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    event.stopPropagation();
    setSelectedNode(node);
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        style: {
          ...n.style,
          border: n.id === node.id ? '2px solid #3b82f6' : undefined,
          borderRadius: n.id === node.id ? '1.5rem' : undefined,
        },
      }))
    );
  }, [setNodes]);

  const closeNodeInfo = useCallback((feature: string) => {
    if (feature === 'documentUpload') {
      if (!isNodeInfoLoading) {
        setSelectedNode(null);
        // setShowChatDialog(false);
        setNodes((nds) =>
          nds.map((n) => ({
            ...n,
            style: { ...n.style, border: undefined },
          }))
        );
      }
    } else {
      setSelectedNode(null);
      // setShowChatDialog(false);
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          style: { ...n.style, border: undefined },
        }))
      );

    }

  }, [setNodes, isNodeInfoLoading]);

  const handleNodeInfoLoadingChange = useCallback((isLoading: boolean) => {
    setIsNodeInfoLoading(isLoading);
  }, []);

  const proOptions = useMemo(() => ({ hideAttribution: true }), []);

  const onUpdateLabel = useCallback((nodeId: string, newLabel: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, label: newLabel } };
        }
        return node;
      })
    );
  }, [setNodes]);

  const onAddNode = useCallback((nodeType: string) => {
    const existingNodes = getNodes();
    const { zoom } = getViewport();

    let newPosition;
    if (existingNodes.length > 0) {
      const lastNode = existingNodes[existingNodes.length - 1];
      newPosition = {
        x: lastNode.position.x + 280 / zoom,
        y: lastNode.position.y
      };
    } else {
      newPosition = { x: 199.09151622227262, y: 80.00000000000006 };
    }

    const newNode = {
      id: uuidv4(),
      type: 'custom',
      position: newPosition,
      data: {
        label: `${nodeType}`,
        onUpdateLabel,
        nodeType: nodeType
      },
      selected: false,
    };
    setNodes((nds) => [...nds, newNode]);
  }, [getNodes, getViewport, onUpdateLabel]);

  const onRemoveNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    setSelectedNode(null);
  }, []);

  const onDeleteSelectedNode = useCallback(() => {
    if (selectedNode) {
      onRemoveNode(selectedNode.id);
    }
  }, [selectedNode, onRemoveNode]);

  useHotkeys('delete', onDeleteSelectedNode, [onDeleteSelectedNode]);



  const onSaveAs = useCallback(async () => {
    try {
      const flowName = prompt("Enter a name for this flow:");
      if (!flowName) return;

      const response = await fetch('/api/flows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: flowName, nodes, edges, userId: user?.id, userName: user?.username }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to save flow: ${errorData.message}`);
      }

      const savedFlow = await response.json();
      onFlowSaved(savedFlow);

      toast({
        title: "Success",
        description: `Flow "${savedFlow.name}" saved successfully`,
        duration: 3000,
        className: "bg-green-100 border-green-400 text-green-700",
      });

      // Update URL and load the new flow
      // if (typeof window !== 'undefined') {
      //   window.history.pushState({}, '', `/flow/${savedFlow.id}`);
      // }

      // Load the newly saved flow
      // await loadFlow(savedFlow.id);
      selectedFlowId = savedFlow.id;
    } catch (error) {
      console.error('Error saving flow:', error);
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to save flow. Please try again.",
        variant: "destructive",
      });
    }
  }, [nodes, edges, toast, user, loadFlow, onFlowSaved]);

  const onSave = useCallback(async () => {
    if (!currentFlowId) {
      onSaveAs();
      return;
    }

    try {
      const response = await fetch(`/api/flows/${currentFlowId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nodes, edges, userId: user?.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to update flow');
      }

      const updatedFlow = await response.json();
      toast({
        title: "Success",
        description: `Flow updated successfully`,
        duration: 3000,
        className: "bg-green-100 border-green-400 text-green-700",
      });

      // onFlowSaved(updatedFlow);
      setFlowName(updatedFlow.name || "Untitled Flow");
      setLastEditTime(new Date(updatedFlow.updatedAt || updatedFlow.createdAt));
    } catch (error) {
      console.error('Error updating flow:', error);
      toast({
        title: "Error",
        description: "Failed to update flow. Please try again.",
        variant: "destructive",
      });
    }
  }, [currentFlowId, nodes, edges, toast, onSaveAs]);


  const onPublish = useCallback(async () => {
    const startNode = nodes.find(node => node.data.nodeType === 'Start');
    const outputNode = nodes.find(node => node.data.nodeType === 'END');
    console.log('[DEBUG] onPublish', nodes);

    if (!startNode || !outputNode) {
      toast({
        title: "Error",
        description: "Flow must contain both Start and Output nodes.",
        variant: "destructive",
      });
      return;
    }

    const isConnected = (node1: Node, node2: Node) => {
      return edges.some(edge =>
        (edge.source === node1.id && edge.target === node2.id) ||
        (edge.source === node2.id && edge.target === node1.id)
      );
    };

    const allNodesConnected = nodes.every(node => {
      if (node.id === startNode.id) return true;
      return edges.some(edge => edge.target === node.id || edge.source === node.id);
    });

    if (!allNodesConnected) {
      toast({
        title: "Error",
        description: "All nodes must be connected in the flow.",
        variant: "destructive",
      });
      return;
    }

    const knowledgeDocumentNode = nodes.find(node => node.data.nodeType === "Knowledge Document");
    const vapiNode = nodes.find(node => node.data.nodeType === 'telephone');
    const knowledgeURLNode = nodes.find(node => node.data.nodeType === "Knowledge URL");
    // console.log('NODES', knowledgeURLNode ,nodes );


    if (knowledgeURLNode) {
      if (!knowledgeURLNode.data.url) {
        toast({
          title: "Error",
          description: "Please input a URL",
          variant: "destructive",
        });
        setSelectedNode(knowledgeURLNode);
        return;
      }
      setShowChatDialog(true);
      return;
    }


    if (knowledgeDocumentNode) {
      if (documents.length == 0) {
        if (!knowledgeDocumentNode.data.fileName) {
          toast({
            title: "Error",
            description: "Please upload a document before running.",
            variant: "destructive",
          });
          setSelectedNode(knowledgeDocumentNode);
          return;
        }
        setShowChatDialog(true);
        return;
      }
    }

    if (vapiNode) {
      // console.log('GET PARAMS', defaultCall);

      if (!vapiClient) {
        toast({
          title: "Error",
          description: "Vapi client is not initialized.",
          duration: 3000,
          variant: "destructive",
        });
        return;
      }

      if (!user) {
        toast({
          title: "Error",
          description: "User is not authenticated.",
          duration: 3000,
          variant: "destructive",
        });
        return;
      }

      const response = await fetch('/api/chat-ratelimit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id, type: 'flow' }),
      });
      const { success } = await response.json();

      if (!success) {
        toast({
          title: "Rate limit exceeded",
          description: "You have reached your chat limit for today.",
          variant: "destructive",
        });
        return;
      }

      setisVapiCalling(true)
      try {
        const call = await vapiClient.start(
          {
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
              "temperature": defaultCall.model.temperature
            },
            "voice": {
              "provider": "11labs",
              "voiceId": defaultCall.voice.voiceId
            },
            // "language": "en",
            "endCallMessage": "terimakasih"

          }
          // {
          //   model: {
          //     provider: defaultCall.model.provider,
          //     model: defaultCall.model.model,
          //     temperature: defaultCall.model.temperature,
          //     messages: [
          //       {
          //         role: defaultCall.model.messages[0].role,
          //         content: defaultCall.model.messages[0].content,
          //       },
          //     ],
          //   },
          //   voice: {
          //     provider: "11labs",
          //     voiceId: defaultCall.voice.voiceId,
          //   },
          //   // prompt: defaultCall.firstMessage, // Add the prompt parameter here
          // }
        );

        vapiClient.on('call-start', () => {
          toast({ title: "Call Status", description: "Ringing...", className: "bg-green-100 border-green-400 text-green-700" });
          setShowVapiPopup(true);
        });
        vapiClient.on('speech-start', () => toast({ title: "Call Status", description: "Connected", className: "bg-green-100 border-green-400 text-green-700" }));
        vapiClient.on('call-end', () => {
          setisVapiCalling(false)
          toast({ title: "Call Status", description: "Call ended", className: "bg-green-100 border-green-400 text-green-700" });
          setShowVapiPopup(false);
        });
      } catch (error) {
        console.error('Error starting VAPI call:', error);
        toast({
          title: "Error",
          description: "Failed to start the VAPI call. Please try again.",
          variant: "destructive",
        });
        setisVapiCalling(false)
      }
    } else {
      setShowChatDialog(true);
    }
  }, [nodes, edges, vapiClient, toast, defaultCall, setSelectedNode, user]);

  const handleVapiDisconnect = useCallback(() => {
    if (vapiClient) {
      vapiClient.stop();
      setShowVapiPopup(false);
    }
  }, [vapiClient]);

  const onCreateNewFlow = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setCurrentFlowId(null);
    setFlowName("Untitled Flow");
    setLastEditTime(new Date());
    onFlowSaved(null); // This will signal the parent component to clear the selected flow
  }, [onFlowSaved]);

  const onNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node, nodes: Node[]) => {
      //   console.log('Node dragged:', node);
      // You can perform additional actions here if needed
    },
    []
  );

  const onNodeDrag = useCallback(
    (event: React.MouseEvent, node: Node, nodes: Node[]) => {
      //   console.log('Node is being dragged:', node);
    },
    []
  );

  const isNodeTypeDisabled = useCallback((nodeType: string) => {
    const hasLLMCustomPrompt = nodes.some(node => node.data.nodeType === 'LLM With Custom Prompt');
    const hasLLMByKnowledge = nodes.some(node => node.data.nodeType === 'LLM By Knowledge');
    const hasKnowledgeDocument = nodes.some(node => node.data.nodeType === 'Knowledge Document');
    const hasKnowledgeURL = nodes.some(node => node.data.nodeType === 'Knowledge URL');
    const hasTelephone = nodes.some(node => node.data.nodeType === 'telephone');
    const hasAnyKnowledgeRetrieval = hasKnowledgeDocument || hasKnowledgeURL;

    switch (nodeType) {
      case 'LLM With Custom Prompt':
        return hasAnyKnowledgeRetrieval || hasTelephone || hasLLMByKnowledge;
      case 'LLM By Knowledge':
        return hasTelephone || hasLLMCustomPrompt;
      case 'Knowledge Document':
      case 'Knowledge URL':
        return hasKnowledgeDocument || hasKnowledgeURL || hasTelephone || hasLLMCustomPrompt;
      case 'telephone':
        return hasLLMCustomPrompt || hasLLMByKnowledge || hasAnyKnowledgeRetrieval;
      default:
        return false;
    }
  }, [nodes]);

  const nodeTypeList = [
    { type: 'Start', label: 'START', icon: Home, bgColor: 'bg-blue-500' },
    {
      type: 'LLM',
      label: 'LLM',
      icon: Brain,
      bgColor: 'bg-purple-500',
      subMenu: [
        // {
        //   type: 'LLM Antonim', label: 'LLM Antonim', icon: Brain,
        //   bgColor: 'bg-purple-500',
        // },
        {
          type: 'LLM With Custom Prompt', label: 'LLM With Custom Prompt', icon: Brain,
          bgColor: 'bg-purple-500',
          description: 'LLM With Custom Prompt',
        },
        {
          type: 'LLM By Knowledge', label: 'LLM By Knowledge', icon: Brain,
          bgColor: 'bg-purple-500',
          description: 'LLM By Knowledge',
        },
      ]
    },
    {
      type: 'Knowledge_Retrieval',
      label: 'Knowledge Retrieval',
      icon: BookOpen,
      bgColor: 'bg-[#ff47bf]',
      subMenu: [
        {
          type: 'Knowledge Document', label: 'Document', icon: ScrollText,
          bgColor: 'bg-[#ff47bf]',
          description: 'Knowledge Document',
        },
        {
          type: 'Knowledge URL', label: 'URL', icon: Link,
          bgColor: 'bg-[#ff47bf]',
          description: 'Knowledge URL',
        },
      ]
    },
    { type: 'telephone', label: 'Telephone', icon: Phone, bgColor: 'bg-green-500', description: 'Telephone AI' },
    { type: 'END', label: 'END', icon: Goal, bgColor: 'bg-orange-500' },
  ];
  if (loadingProgress !== null) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-75 z-50 border border-white">
        <div className="text-center">
          <div className="mb-4 text-xl font-semibold">Loading Flow</div>
          <div className="w-64 h-6 bg-gray-200 rounded-full">
            <div
              className="h-full bg-[#6c47ff]  rounded-full transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          <div className="mt-2">{loadingProgress}%</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full  flex flex-col relative">

      <Card className="flex-1 overflow-hidden shadow-lg mb-[1vh]">
        <CardContent className="p-0 h-full">
          <div className="flex justify-between p-4 items-center h-[8vh]">
            <div className="flex flex-col">
              <h2 className="text-2xl font-semibold">{flowName}</h2>
              {lastEditTime && (
                <p className="text-xs text-gray-500">
                  Last edited: {format(lastEditTime, 'MMM d, yyyy HH:mm')}
                </p>
              )}
            </div>

            <div>
              <Button onClick={onCreateNewFlow} variant="ghost" className="ml-2 bg-[#f4f4f4] hover:bg-[#6c47ff]  text-black hover:text-white" title="Create New Flow">
                <FilePlus className="h-5 w-5" />
              </Button>
              {nodes.find(node => node.data.nodeType === "Knowledge Document") && (
                <Button onClick={onViewDocument} variant="ghost" className="ml-2 bg-[#f4f4f4] hover:bg-[#6c47ff] text-black hover:text-white" title="View Document">
                  <Table className="h-5 w-5" />
                </Button>
              )}
              <Button onClick={onSave} variant="ghost" className="ml-2 bg-[#f4f4f4] hover:bg-[#6c47ff]  text-black hover:text-white" title="Save">
                <Save className="h-5 w-5" />
              </Button>
              {/* <Button onClick={onSaveAs} variant="ghost" className="ml-2 bg-blue-500 hover:bg-blue-400 text-white" title="Save As">
                <SaveAll className="h-5 w-5" />
              </Button> */}
              {nodes.find(node => node.data.nodeType === 'telephone') ? (
                <Button
                  onClick={onPublish}
                  variant="ghost"
                  className={`ml-2 items-center ${isVapiCalling ? 'bg-green-300' : 'bg-green-500'} hover:bg-[#f4f4f4] text-white`}
                  disabled={isVapiCalling}
                >
                  {isVapiCalling ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Calling...
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      Call
                    </>
                  )}
                </Button>
              ) : (
                <Button onClick={onPublish} variant="ghost" className="ml-2  items-center bg-green-500 hover:bg-[#f4f4f4] text-white">
                  <Play className="h-5 w-5 mr-2" />
                  Run
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1 overflow-hidden shadow-lg">
        <CardContent className="p-0 h-full">
          <div className='h-[75vh]'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="bg-blue-500 h-[5vh] w-[2.3vw] flex justify-center items-center text-white hover:bg-blue-600 absolute left-[1vw] top-[12vh] z-[9] rounded-full" title="Add new node">
                  <Plus className="w-6 h-6" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="z-[4] w-[18vw] ml-[18vw]" >
                {nodeTypeList.map((nodeType) => (
                  nodeType.type === 'LLM' || nodeType.type == 'Knowledge_Retrieval' ? (
                    <DropdownMenu key={nodeType.type}>
                      <DropdownMenuTrigger className="w-full text-left flex items-center px-2 py-1 hover:bg-gray-100">
                        <div className={`w-6 h-6 rounded-full ${nodeType.bgColor} flex items-center justify-center mr-2`}>
                          <nodeType.icon className="w-4 h-4 text-white" />
                        </div>
                        {nodeType.label}
                        <ChevronRight className="ml-auto h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" alignOffset={-5} className="ml-2">
                        {nodeType.subMenu!.map((subItem) => (
                          <DropdownMenuItem 
                            key={subItem.type} 
                            onSelect={() => !isNodeTypeDisabled(subItem.type) && onAddNode(subItem.type)} 
                            className={`flex items-center ${isNodeTypeDisabled(subItem.type) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isNodeTypeDisabled(subItem.type)}
                          >
                            <div className={`w-6 h-6 rounded-full ${subItem.bgColor} flex items-center justify-center mr-2`}>
                              <subItem.icon className="w-4 h-4 text-white" />
                            </div>
                            {subItem.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <DropdownMenuItem 
                      key={nodeType.type} 
                      onSelect={() => !isNodeTypeDisabled(nodeType.type) && onAddNode(nodeType.type)} 
                      className={`flex items-center ${isNodeTypeDisabled(nodeType.type) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={isNodeTypeDisabled(nodeType.type)}
                    >
                      <div className={`w-6 h-6 rounded-full ${nodeType.bgColor} flex items-center justify-center mr-2`}>
                        <nodeType.icon className="w-4 h-4 text-white" />
                      </div>
                      {nodeType.label}
                    </DropdownMenuItem>
                  )
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {selectedNode && (
              <div
                title='Remove Node'
                onClick={() => onRemoveNode(selectedNode.id)}
                className="absolute top-[20vh] left-[1vw] z-[4] bg-red-600 h-[5vh] w-[2.3vw] flex justify-center items-center text-white hover:bg-red-500 rounded-full cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-110 hover:rotate-12 animate-fadeIn"
              >
                <Trash2 className="h-4 w-4" />
              </div>
            )}
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onNodeDrag={onNodeDrag}
              onNodeDragStop={onNodeDragStop}
              onPaneClick={() => closeNodeInfo('reactflow')}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              proOptions={proOptions}
              defaultViewport={{ x: 0, y: 0, zoom: 0.6 }}
              className="flex-grow "
            >
              <Controls />
              <MiniMap />
              <Background bgColor='#f4f4f4' />
            </ReactFlow>
            {selectedNode && !['Start', 'END'].includes(selectedNode.data.nodeType as string) && (
              selectedNode.data.nodeType === 'telephone' ? (
                <NodeInfoCardVapi
                  node={selectedNode as Node<NodeData & Record<string, unknown>>}
                  onClose={() => closeNodeInfo('nodeInfoVapi')}
                  onUpdateNode={onUpdateNodevapi}
                />
              ) : selectedNode.data.nodeType === 'LLM By Knowledge' ? (
                <NodeInfoCardDoc
                  node={selectedNode as Node<NodeData & Record<string, unknown>>}
                  onClose={() => closeNodeInfo('nodeInfoDoc')}
                  onUpdateNode={onUpdateNode}
                />
              ) : selectedNode.data.nodeType === 'Knowledge Document' ? (
                <NodeInfoCardKnowledgeRetrieval
                  node={selectedNode as Node<NodeData & Record<string, unknown>>}
                  onClose={() => closeNodeInfo('documentUpload')}
                  onUpdateNode={onUpdateNode}
                  onLoadingChange={handleNodeInfoLoadingChange}
                />
              ) : selectedNode.data.nodeType === 'Knowledge URL' ? (
                <NodeInfoCardURL
                  node={selectedNode as Node<NodeData & Record<string, unknown>>}
                  onClose={() => closeNodeInfo('url')}
                  onUpdateNode={onUpdateNode}
                />
              ) : (
                <NodeInfoCard
                  node={selectedNode as Node<NodeData & Record<string, unknown>>}
                  onClose={() => closeNodeInfo('infocard')}
                  onUpdateNode={onUpdateNode}
                />
              )
            )}
            {showChatDialog && (
              <ChatDialog
                onClose={() => setShowChatDialog(false)}
                selectedNode={selectedNode}
                nodes={nodes}
                edges={edges}
                isNodeInfoCardOpen={!!selectedNode && !['Start', 'END'].includes(selectedNode.data.nodeType as string)}
              />
            )}
            {showVapiPopup && (
              <VapiPopup onDisconnect={handleVapiDisconnect} />
            )}
          </div>
          <DocumentViewPopup
            isOpen={isDocumentViewOpen}
            onClose={() => setIsDocumentViewOpen(false)}
            user={user}
          />
        </CardContent>
      </Card>


      <Toaster />
    </div>
  );
}