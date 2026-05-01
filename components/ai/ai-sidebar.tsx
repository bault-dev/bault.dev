"use client"

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SparkleIcon, SendHorizonal, ArrowUpIcon } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";

export const AISidebar = () => {
  const [input, setInput] = useState('');
  const { messages, sendMessage } = useChat();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!input.trim()) return;
      sendMessage({ text: input });
      setInput('');
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <SparkleIcon className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col mx-4 my-auto data-[side=right]:h-[calc(100vh-2rem)] rounded-xl data-[side=right]:border-4 overflow-hidden p-0">
        <SheetHeader>
          <SheetTitle>AI</SheetTitle>
          <SheetDescription>
            Ask AI anything
          </SheetDescription>
        </SheetHeader>

        {/* Messages area */}
        <div className="no-scrollbar flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-3">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex flex-col gap-1 ${message.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <span className="text-xs text-muted-foreground">
                {message.role === 'user' ? 'Tú' : 'AI'}
              </span>
              <div
                className={`rounded-lg px-3 py-2 text-sm max-w-[85%] whitespace-pre-wrap ${message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
                  }`}
              >
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case 'text':
                      return <span key={`${message.id}-${i}`}>{part.text}</span>;
                    case 'tool-weather':
                    case 'tool-convertFahrenheitToCelsius':
                      return (
                        <pre key={`${message.id}-${i}`}>
                          {JSON.stringify(part, null, 2)}
                        </pre>
                      );
                    default:
                      return null;
                  }
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Input area */}
        <form onSubmit={handleSubmit} className="px-4 pb-4">
          <InputGroup>
            <InputGroupTextarea
              value={input}
              placeholder="Escribe un mensaje... (Enter para enviar)"
              onChange={e => setInput(e.currentTarget.value)}
              onKeyDown={handleKeyDown}
              className="min-h-4"
            />
            <InputGroupAddon align="block-end" className="flex justify-end">
              <InputGroupButton
                type="submit"
                variant="default"
                size="icon-sm"
                className="rounded-full"
                disabled={!input.trim()}
              >
                <ArrowUpIcon />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </form>
      </SheetContent>
    </Sheet>
  )
};

