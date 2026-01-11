'use client';

import { useRef, useEffect, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, RotateCcw } from 'lucide-react';
import { ScrollArea } from '@/components/ui/layout/scroll-area';
import { 
  Message, 
  MessageContent, 
  MessageActions, 
  MessageAction 
} from '../ai-elements/message';
import { ArtifactView } from './artifact-view';

export function AssistantChat() {
  // AI SDK v3 uses different API - we need to create a chat instance
  const { messages, status, sendMessage, regenerate } = useChat();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const isLoading = status === 'streaming' || status === 'submitted';

  // Auto scroll when messages change or loading state changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: Intentionally re-run when messages or loading changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userInput = input;
    setInput('');
    // AI SDK v3 sendMessage takes a message or parts array
    await sendMessage({ parts: [{ type: 'text', text: userInput }] });
  };

  // Helper to extract text content from message parts
  const getMessageContent = (message: typeof messages[number]): string => {
    if (!message.parts) return '';
    return message.parts
      .filter((part) => part.type === 'text')
      .map(part => (part as { type: 'text'; text: string }).text)
      .join('');
  };

  // Helper to get tool invocations from message parts
  interface ToolInvocationPart {
    type: 'tool-invocation';
    toolInvocation: {
      toolName: string;
      toolCallId: string;
      state: string;
      result?: { code: string; title: string; type: 'react' | 'html'; explanation?: string };
    };
  }

  const getToolInvocations = (message: typeof messages[number]): ToolInvocationPart[] => {
    if (!message.parts) return [];
    return message.parts
      .filter((part) => part.type === 'tool-invocation')
      .map(part => part as unknown as ToolInvocationPart);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6 pb-4">
          {messages.map((message) => {
            const content = getMessageContent(message);
            const toolParts = getToolInvocations(message);
            
            return (
              <Message 
                key={message.id} 
                from={message.role === 'user' ? 'user' : 'assistant'}
              >
                <MessageContent>
                  {/* Text Content */}
                  {content && (
                     <div className="whitespace-pre-wrap">{content}</div>
                  )}

                  {/* Tool Invocations (Artifacts) */}
                  {toolParts.map((part) => {
                    const toolInvocation = part.toolInvocation;
                    if (toolInvocation.toolName === 'generate_ui') {
                       // Loading state
                       if (toolInvocation.state !== 'result' || !toolInvocation.result) {
                           return (
                              <div key={toolInvocation.toolCallId} className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground animate-pulse mt-2">
                                  Generating Artifact...
                              </div>
                           );
                       }

                       const { code, title, type, explanation } = toolInvocation.result;

                       return (
                          <ArtifactView
                              key={toolInvocation.toolCallId}
                              code={code}
                              title={title}
                              type={type}
                              explanation={explanation}
                          />
                       );
                    }
                    return null;
                  })}
                </MessageContent>
                
                {message.role === 'assistant' && !isLoading && (
                    <MessageActions>
                        <MessageAction 
                          onClick={() => regenerate()} 
                          tooltip="Regenerate"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </MessageAction>
                    </MessageActions>
                )}
              </Message>
            );
          })}
          
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
             <Message from="assistant">
                 <MessageContent>
                     <div className="flex gap-2 items-center text-muted-foreground">
                         <span className="animate-pulse">Thinking...</span>
                     </div>
                 </MessageContent>
             </Message>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
      <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <form onSubmit={onFormSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI to create a template..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
