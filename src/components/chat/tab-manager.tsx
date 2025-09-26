'use client';

import { ChatTab } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, X, MessageCircle, Edit3, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TabManagerProps {
  tabs: ChatTab[];
  activeTabId: string | null;
  onTabSelect: (tabId: string) => void;
  onTabCreate: () => void;
  onTabClose: (tabId: string) => void;
}

export function TabManager({ 
  tabs, 
  activeTabId, 
  onTabSelect, 
  onTabCreate, 
  onTabClose 
}: TabManagerProps) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 24 * 7) {
      const days = Math.floor(diffInHours / 24);
      return `${days} 天前`;
    } else {
      return date.toLocaleDateString('zh-CN', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getTabTitle = (tab: ChatTab) => {
    if (tab.messages.length === 0) {
      return '新对话';
    }
    const firstUserMessage = tab.messages.find(m => m.role === 'user');
    if (firstUserMessage) {
      return firstUserMessage.content.slice(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '');
    }
    return tab.title;
  };

  // 按时间分组
  const groupedTabs = tabs.reduce((groups, tab) => {
    const now = new Date();
    const diffInHours = (now.getTime() - tab.lastActive.getTime()) / (1000 * 60 * 60);
    
    let groupKey = '';
    if (diffInHours < 24) {
      groupKey = '今天';
    } else if (diffInHours < 24 * 7) {
      groupKey = '最近 7 天';
    } else {
      groupKey = '更早';
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(tab);
    return groups;
  }, {} as Record<string, ChatTab[]>);

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white border-r border-gray-700">
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <Button 
          onClick={onTabCreate}
          className="w-full bg-transparent border border-gray-600 hover:bg-gray-800 text-white justify-start gap-2 h-10"
        >
          <Plus className="h-4 w-4" />
          新建聊天
        </Button>
      </div>

      {/* Tab List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {Object.entries(groupedTabs).map(([groupName, groupTabs]) => (
            <div key={groupName} className="mb-4">
              <div className="px-2 py-1 text-xs font-medium text-gray-400 uppercase tracking-wide">
                {groupName}
              </div>
              <div className="space-y-1 mt-2">
                {groupTabs.map((tab) => (
                  <div
                    key={tab.id}
                    className={cn(
                      "group relative p-2 rounded-md cursor-pointer transition-all hover:bg-gray-800",
                      activeTabId === tab.id 
                        ? "bg-gray-800" 
                        : ""
                    )}
                    onClick={() => onTabSelect(tab.id)}
                  >
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate text-gray-200">
                          {getTabTitle(tab)}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        {tabs.length > 1 && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              onTabClose(tab.id);
                            }}
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Loading indicator */}
                    {tab.isLoading && (
                      <div className="absolute top-2 right-2">
                        <div className="h-1.5 w-1.5 bg-blue-400 rounded-full animate-pulse" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      {/* <div className="p-3 border-t border-gray-700">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2 text-gray-300 hover:bg-gray-800 h-10"
        >
          <Menu className="h-4 w-4" />
          设置
        </Button>
      </div> */}
    </div>
  );
}
