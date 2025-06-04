'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetDescription, SheetClose } from '@/components/ui/sheet';
import { MessageSquare, Send, Loader2, User, Sparkles } from 'lucide-react';
import { electionChatbot } from '@/ai/flows/election-chatbot-flow';
import type { ElectionChatbotInput } from '@/ai/flows/election-chatbot-flow';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  isLoading?: boolean;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isBotLoading, setIsBotLoading] = React.useState(false);
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: inputValue,
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue('');
    setIsBotLoading(true);
    
    const loadingBotMessageId = `bot-loading-${Date.now()}`;
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: loadingBotMessageId, sender: 'bot', text: '', isLoading: true },
    ]);

    try {
      const genkitInput: ElectionChatbotInput = {
        query: inputValue,
        history: messages.reduce((acc, msg, index) => {
            if (msg.sender === 'user') {
              acc.push({ user: msg.text });
            } else if (msg.sender === 'bot' && !msg.isLoading) {
              // Ensure the last message in acc is a user message or start a new entry
              if (acc.length === 0 || acc[acc.length-1].model !== undefined) {
                 // This case should ideally not happen if user always speaks first
                 // or if we are pairing user/model correctly.
                 // For safety, if we find a bot message without a preceding user message in history,
                 // we might choose to skip it or handle it as context.
                 // For now, let's assume paired interaction.
              } else {
                acc[acc.length - 1].model = msg.text;
              }
            }
            return acc;
          }, [] as { user?: string; model?: string }[]).filter(h => h.user && h.model) // Filter out incomplete history pairs for the prompt
      };
      
      const result = await electionChatbot(genkitInput);
      const botResponse: Message = {
        id: `bot-response-${Date.now()}`,
        sender: 'bot',
        text: result.response,
      };
      setMessages((prevMessages) => prevMessages.map(msg => msg.id === loadingBotMessageId ? botResponse : msg));
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorResponse: Message = {
        id: `bot-error-${Date.now()}`,
        sender: 'bot',
        text: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages((prevMessages) => prevMessages.map(msg => msg.id === loadingBotMessageId ? errorResponse : msg));
    } finally {
      setIsBotLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-50 bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={() => setIsOpen(true)}
        aria-label="Open Chatbot"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
          <SheetHeader className="p-6 pb-2">
            <SheetTitle className="flex items-center">
              <Sparkles className="mr-2 h-5 w-5 text-primary" /> Election Info Chatbot
            </SheetTitle>
            <SheetDescription>
              Ask questions about election processes and history.
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="flex-grow p-6" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {message.isLoading ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    ) : (
                       message.text.split('\\n').map((line, index) => (
                        <React.Fragment key={index}>
                          {line}
                          {index < message.text.split('\\n').length - 1 && <br />}
                        </React.Fragment>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <SheetFooter className="p-4 border-t">
            <div className="flex w-full items-center space-x-2">
              <Input
                type="text"
                placeholder="Ask about elections..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isBotLoading && handleSendMessage()}
                disabled={isBotLoading}
                className="flex-grow"
              />
              <Button type="submit" size="icon" onClick={handleSendMessage} disabled={isBotLoading || !inputValue.trim()}>
                {isBotLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="sr-only">Send message</span>
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
