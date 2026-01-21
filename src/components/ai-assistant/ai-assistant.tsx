'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/shadcn/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/shadcn/sheet';
import { Bot, Sparkles } from 'lucide-react';
import { AssistantChat } from './assistant-chat';

export function AIAssistant() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl z-50 hover:scale-105 transition-all duration-300 bg-primary hover:bg-primary/90"
        >
          <Sparkles className="h-6 w-6 text-primary-foreground" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] flex flex-col p-0 gap-0 border-l border-border shadow-2xl">
        <SheetHeader className="p-4 border-b bg-muted/30">
            <SheetTitle className="flex items-center gap-2 text-primary">
                <Bot className="h-5 w-5" />
                AI Assistant
            </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-hidden relative bg-background">
            <AssistantChat />
        </div>
      </SheetContent>
    </Sheet>
  );
}

