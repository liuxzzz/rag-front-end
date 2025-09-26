'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-end gap-2 bg-white border border-gray-300 rounded-xl shadow-sm focus-within:border-gray-400 focus-within:shadow-md transition-all">
          <div className="flex-1">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="发送消息给 ChatBot"
              disabled={disabled}
              className="resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-xl p-4 text-[15px] leading-6"
              rows={1}
              style={{ 
                height: '100px',
                minHeight: '100px',
                maxHeight: '100px'
              }}
            />
          </div>
          
          <div className="flex items-center gap-1 p-2">
            <Button 
              type="button"
              variant="ghost" 
              size="sm"
              className="text-gray-500 hover:text-gray-700 h-8 w-8 p-0"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <Button 
              type="submit" 
              disabled={disabled || !message.trim()} 
              size="sm"
              className="h-8 w-8 p-0 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          按 Enter 发送，Shift + Enter 换行
        </div>
      </form>
    </div>
  );
}
