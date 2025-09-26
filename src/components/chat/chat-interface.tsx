'use client';

import { useState, useCallback } from 'react';
import { ChatTab, Message } from '@/types/chat';
import { TabManager } from './tab-manager';
import { ChatPanel } from './chat-panel';
import { Separator } from '@/components/ui/separator';

export function ChatInterface() {
  const [tabs, setTabs] = useState<ChatTab[]>([
    {
      id: '1',
      title: '新对话',
      messages: [],
      isLoading: false,
      createdAt: new Date(),
      lastActive: new Date(),
    }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('1');

  const activeTab = tabs.find(tab => tab.id === activeTabId) || null;

  // 创建新 Tab
  const handleTabCreate = useCallback(() => {
    const newTab: ChatTab = {
      id: Date.now().toString(),
      title: '新对话',
      messages: [],
      isLoading: false,
      createdAt: new Date(),
      lastActive: new Date(),
    };
    
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, []);

  // 关闭 Tab
  const handleTabClose = useCallback((tabId: string) => {
    if (tabs.length <= 1) return; // 至少保留一个 tab
    
    setTabs(prev => {
      const newTabs = prev.filter(tab => tab.id !== tabId);
      // 如果关闭的是当前激活的 tab，切换到第一个 tab
      if (tabId === activeTabId) {
        setActiveTabId(newTabs[0]?.id || '');
      }
      return newTabs;
    });
  }, [tabs.length, activeTabId]);

  // 选择 Tab
  const handleTabSelect = useCallback((tabId: string) => {
    setActiveTabId(tabId);
    // 更新最后活跃时间
    setTabs(prev => prev.map(tab => 
      tab.id === tabId 
        ? { ...tab, lastActive: new Date() }
        : tab
    ));
  }, []);

  // 发送消息
  const handleSendMessage = useCallback(async (content: string) => {
    if (!activeTab) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    // 更新当前 tab 的消息和状态
    setTabs(prev => prev.map(tab => 
      tab.id === activeTabId 
        ? { 
            ...tab, 
            messages: [...tab.messages, userMessage],
            isLoading: true,
            lastActive: new Date()
          }
        : tab
    ));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: content }),
      });

      if (!response.ok) {
        throw new Error('网络请求失败');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '',
        role: 'assistant',
        timestamp: new Date(),
        isStreaming: true,
      };

      // 添加 AI 消息到当前 tab
      setTabs(prev => prev.map(tab => 
        tab.id === activeTabId 
          ? { ...tab, messages: [...tab.messages, assistantMessage] }
          : tab
      ));

      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;

        if (value) {
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                setTabs(prev => prev.map(tab => 
                  tab.id === activeTabId 
                    ? { 
                        ...tab, 
                        messages: tab.messages.map(msg => 
                          msg.id === assistantMessage.id 
                            ? { ...msg, isStreaming: false }
                            : msg
                        )
                      }
                    : tab
                ));
                break;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  setTabs(prev => prev.map(tab => 
                    tab.id === activeTabId 
                      ? { 
                          ...tab, 
                          messages: tab.messages.map(msg => 
                            msg.id === assistantMessage.id 
                              ? { ...msg, content: msg.content + parsed.content }
                              : msg
                          )
                        }
                      : tab
                  ));
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: '抱歉，发生了错误。请稍后再试。',
        role: 'assistant',
        timestamp: new Date(),
      };

      setTabs(prev => prev.map(tab => 
        tab.id === activeTabId 
          ? { ...tab, messages: [...tab.messages, errorMessage] }
          : tab
      ));
    } finally {
      // 取消加载状态
      setTabs(prev => prev.map(tab => 
        tab.id === activeTabId 
          ? { ...tab, isLoading: false }
          : tab
      ));
    }
  }, [activeTab, activeTabId]);

  return (
    <div className="flex h-screen w-full mx-auto shadow-2xl rounded-lg overflow-hidden bg-white">
      {/* Left Sidebar - Tab Manager */}
      <div className="w-80 flex-shrink-0">
        <TabManager
          tabs={tabs}
          activeTabId={activeTabId}
          onTabSelect={handleTabSelect}
          onTabCreate={handleTabCreate}
          onTabClose={handleTabClose}
        />
      </div>

      {/* Right Side - Chat Panel */}
      <div className="flex-1">
        <ChatPanel
          activeTab={activeTab}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}
