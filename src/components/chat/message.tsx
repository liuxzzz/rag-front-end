'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Message } from '@/types/chat';
import { Bot, User, Copy, RotateCcw, ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from './markdown-renderer';
import { useState } from 'react';

interface MessageProps {
  message: Message;
}

export function MessageComponent({ message }: MessageProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  return (
    <div className={cn(
      'group px-4 py-6 transition-colors hover:bg-gray-50/50',
      isUser ? 'bg-gray-50/30' : 'bg-white'
    )}>
      <div className="max-w-4xl mx-auto flex gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <Avatar className="h-8 w-8">
            <AvatarFallback className={cn(
              'text-white font-medium',
              isUser 
                ? 'bg-blue-600' 
                : 'bg-green-600'
            )}>
              {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
        </div>
        
        {/* Message Content */}
        <div className="flex-1 min-w-0">
          <div className="mb-1">
            <span className="text-sm font-medium text-gray-900">
              {isUser ? '您' : 'ChatBot'}
            </span>
          </div>
          {/* Message Content */}
          <div className="text-gray-800">
            {isUser ? (
              // 用户消息使用简单文本渲染
              <div className="text-[15px] leading-7 whitespace-pre-wrap break-words">
                {message.content}
              </div>
            ) : (
              // AI 消息使用 Markdown 渲染
              <MarkdownRenderer 
                content={message.content} 
                isStreaming={message.isStreaming}
              />
            )}
          </div>
          
          {/* Message Actions (只在hover时显示) */}
          <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-3">
              <button 
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Copy className="h-3 w-3" />
                {copied ? '已复制' : '复制'}
              </button>
              
              {!isUser && (
                <>
                  <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors">
                    <RotateCcw className="h-3 w-3" />
                    重新生成
                  </button>
                  
                  <div className="flex items-center gap-1">
                    <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                      <ThumbsUp className="h-3 w-3" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                      <ThumbsDown className="h-3 w-3" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
