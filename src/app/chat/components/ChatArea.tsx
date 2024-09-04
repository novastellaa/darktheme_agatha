import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SendIcon, MenuIcon, UserIcon, MicIcon, ChevronRightIcon, ListIcon, MoreHorizontal, ArrowRightIcon, Loader2 } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { usePopper } from 'react-popper'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { CopyIcon, CheckIcon } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Magic from '@/components/tailwind/magic'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

type ChatAreaProps = {
  messages: any[]
  input: string
  handleInputChange: (value: string) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  messagesEndRef: React.RefObject<HTMLDivElement>
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  title?: string
  description?: string
  currentPromptDescription?: string
  isPromptListVisible: boolean;
  togglePromptList: () => void;
}

export default function ChatArea({
  messages,
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  messagesEndRef,
  sidebarOpen,
  setSidebarOpen,
  title = "Chat AI",
  description = "Start a conversation with the AI assistant.",
  currentPromptDescription = "Start a conversation with the AI assistant.",
  isPromptListVisible,
  togglePromptList
}: ChatAreaProps) {

  const [isListening, setIsListening] = useState(false)
  const [selectedText, setSelectedText] = useState('');
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  const [showPopper, setShowPopper] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
  })
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'top',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 8],
        },
      },
    ],
  });

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      setSelectedText(selection.toString());
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setReferenceElement({
        getBoundingClientRect: () => rect,
      } as HTMLElement);
      setShowPopper(true);
    } else {
      setShowPopper(false);
    }
  }, []);


  const formatMessage = (content: string) => {
    const codeBlockRegex = /```([\s\S]*?)```/g;
    const parts = content.split(codeBlockRegex);

    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // This is a code block
        const [language, ...codeLines] = part.trim().split('\n');
        const code = codeLines.join('\n');
        return (
          <div key={index} className="relative my-4">
            <div className="bg-gray-800 text-gray-200 rounded-t-md px-4 py-2 text-sm font-mono flex items-center justify-between">
              <span>{language || 'Code'}</span>
              <CopyButton text={code} />
            </div>
            <SyntaxHighlighter
              language={language.toLowerCase() || 'text'}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
              }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        );
      }
      // This is regular text
      return <p key={index} className="mb-2 text-gray-800">{part}</p>;
    });
  };
  const CopyButton = ({ text }: { text: string }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
      navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    };

    return (
      <button
        onClick={handleCopy}
        className="p-1 rounded-md bg-dark-800 hover:bg-gray-600 transition-colors"
        aria-label="Copy code"
      >
        {isCopied ? (
          <CheckIcon className="h-4 w-4 text-green-500" />
        ) : (
          <CopyIcon className="h-4 w-4 text-gray-300" />
        )}
      </button>
    );
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleTextSelection);
    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
    };
  }, [handleTextSelection]);

  const handleAskAI = async (action: 'reply' | 'generate') => {
    if (action === 'reply') {
      handleInputChange(`Regarding the following text: "${selectedText}", can you explain or elaborate on it?`);
    } else if (action === 'generate') {
      setIsGenerating(true);
      // try {
      //   const response = await openai.createCompletion({
      //     model: "text-davinci-002",
      //     prompt: `Regarding the following text: "${selectedText}", can you explain or elaborate on it?`,
      //     max_tokens: 150,
      //     n: 1,
      //     stop: null,
      //     temperature: 0.7,
      //   });

      //   const generatedText = response.data.choices[0].text?.trim() || '';
      //   setGeneratedContent(generatedText);

      //   if (editor) {
      //     editor.commands.setContent(generatedText);
      //     editor.commands.focus('end');
      //   }
      // } catch (error) {
      //   console.error('Error generating text:', error);
      //   setGeneratedContent('An error occurred while generating text.');
      // } finally {
      //   setIsGenerating(false);
      // }
    }
    setShowPopper(false);
  };



  const startListening = () => {
    setIsListening(true)
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('')
      handleInputChange(transcript)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()

    return () => {
      recognition.stop()
      setIsListening(false)
    }
  }

  const stopListening = () => {
    setIsListening(false)
  }

  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setReferenceElement(event.currentTarget as any);
    setSelectedText(window.getSelection()?.toString() || '');
  };


  return (
    <main className="flex-1 flex flex-col bg-gray border border-gray-200 rounded-lg overflow-hidden h-full">
      <header className="border-b border-gray-200 p-4 flex justify-between items-center">
        <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
        <Button onClick={() => setSidebarOpen(!sidebarOpen)} variant="ghost" className="text-gray-500 md:hidden">
          <MenuIcon className="h-5 w-5" />
        </Button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={togglePromptList} variant="ghost" className="text-gray-500">
                {isPromptListVisible ? <ChevronRightIcon className="h-5 w-5" /> : <ListIcon className="h-5 w-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isPromptListVisible ? 'Hide Prompt List' : 'Show Prompt List'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </header>
      <div className="flex-grow flex flex-col overflow-hidden">
        <ScrollArea className="flex-grow h-full">
          <div className="max-w-2xl mx-auto py-4 px-4">
            {messages.length === 0 ? (
              <div className="text-center py-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
                <p className="text-gray-600">{currentPromptDescription}</p>
              </div>
            ) : (
              messages.map(m => (
                <div key={m.id} className={`mb-6 ${m.role === 'user' ? 'flex justify-end' : ''}`}>
                  <div className={`flex items-start ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${m.role === 'user' ? 'bg-gray-200 ml-4' : 'mr-4'
                      }`} style={m.role === 'user' ? {} : { backgroundColor: 'rgb(0 0 0)', color: 'white' }}>
                      {m.role === 'user' ? <UserIcon className="w-5 h-5 text-gray-600" /> : 'AI'}
                    </div>
                    <div className="flex-grow overflow-hidden">
                      <div className="text-sm font-semibold mb-1"></div>
                      <div className="text-gray-800 break-words">{formatMessage(m.content)}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>
      <footer className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto relative">
          <Input
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Send a message"
            className="w-full bg-white border border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-300 text-gray-800 pr-24 shadow-sm"
          />
          <Button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className="absolute right-12 top-1/2 transform -translate-y-1/2 bg-transparent hover:bg-gray-100"
          >
            <MicIcon className={`h-5 w-5 ${isListening ? 'text-red-500' : 'text-gray-500'}`} />
          </Button>
          <Button type="submit" disabled={isLoading} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent hover:bg-gray-100">
            <SendIcon className="h-5 w-5 text-gray-500" />
          </Button>
        </form>
      </footer>
      {showPopper && (
        <div
          ref={setPopperElement}
          style={styles.popper}
          {...attributes.popper}
          className="bg-white border border-gray-200 shadow-lg rounded-lg p-2 z-50"
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="gap-1 rounded-none text-purple-500"
                variant="ghost"
                size="sm"
              >
                <Magic className="h-5 w-5" />
                Ask AI
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleAskAI('reply')}>
                Reply
                <SendIcon className="ml-auto h-4 w-4" />
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAskAI('generate')} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    Generating...
                    <Loader2 className="ml-auto h-4 w-4 animate-spin" />
                  </>
                ) : (
                  <>
                    Next Generate
                    <ArrowRightIcon className="ml-auto h-4 w-4" />
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {generatedContent && (
            <div className="mt-2 p-2 bg-gray-100 rounded">
              <EditorContent editor={editor} />
            </div>
          )}
        </div>
      )}
    </main>
  )
}