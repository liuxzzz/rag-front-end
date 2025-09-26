'use client';

import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageComponent } from './message';
import { ChatInput } from './chat-input';
import { ChatTab } from '@/types/chat';
import { MoreHorizontal, Share } from 'lucide-react';

interface ChatPanelProps {
  activeTab: ChatTab | null;
  onSendMessage: (message: string) => void;
}

export function ChatPanel({ activeTab, onSendMessage }: ChatPanelProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeTab?.messages]);

  if (!activeTab) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center text-gray-600 max-w-md">
          <div className="text-6xl mb-6">💬</div>
          <h3 className="text-2xl font-semibold mb-3 text-gray-800">
            欢迎使用 ChatBot
          </h3>
          <p className="text-gray-600 mb-6">
            选择一个对话或创建新对话开始聊天。我可以帮助您解答问题、编写代码、创作内容等。
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="font-medium mb-1">💡 智能问答</div>
              <div className="text-gray-600">回答各种问题</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="font-medium mb-1">📝 内容创作</div>
              <div className="text-gray-600">协助写作和编辑</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="font-medium mb-1">💻 代码助手</div>
              <div className="text-gray-600">编程和调试帮助</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="font-medium mb-1">🔍 数据分析</div>
              <div className="text-gray-600">信息整理分析</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-gray-800">ChatBot</h3>
          {activeTab.messages.length > 0 && (
            <span className="text-sm text-gray-500">
              {activeTab.messages.length} 条消息
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
            <Share className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
            <MoreHorizontal className="h-4 w-4" />
          </Button> */}
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 overflow-y-auto">
        <div className="min-h-full">
          {activeTab.messages.length === 0 ? (
            <div className="flex items-center justify-center h-full p-8">
              <div className="text-center text-gray-600 max-w-lg">
                <div className="text-4xl mb-4">👋</div>
                <h4 className="text-xl font-semibold mb-2 text-gray-800">
                  开始新对话
                </h4>
                <p className="text-gray-600 mb-6">
                  我是您的 AI 助手，可以帮您解答问题、协助工作或进行创作。请在下方输入您的问题。
                </p>
            
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {activeTab.messages.map((message) => (
                <MessageComponent key={message.id} message={message} />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Chat Input */}
      <div className="relative">
        {/* 渐变遮罩 */}
        <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-white to-transparent pointer-events-none z-10"></div>
        <div className="border-t border-gray-200 bg-white">
          <div className="max-w-4xl mx-auto">
            <ChatInput 
              onSendMessage={onSendMessage} 
              disabled={activeTab.isLoading} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
