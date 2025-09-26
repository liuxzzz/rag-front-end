'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
}

export function MarkdownRenderer({ content, isStreaming }: MarkdownRendererProps) {
  return (
    <div className="prose prose-sm max-w-none text-gray-800">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // 简化的代码块渲染
          code: ({ className, children }) => {
            const isInline = !className;
            const language = className?.replace('language-', '') || '';
            
            if (isInline) {
              return (
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">
                  {children}
                </code>
              );
            }
            
            return (
              <div className="relative group my-4">
                {language && (
                  <div className="flex items-center justify-between bg-gray-100 px-4 py-2 text-xs text-gray-600 border-b">
                    <span className="font-medium">{language}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(String(children))}
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-gray-800"
                    >
                      复制
                    </button>
                  </div>
                )}
                <pre className={`bg-gray-50 p-4 rounded ${language ? '!mt-0 !rounded-t-none' : ''} overflow-x-auto`}>
                  <code className={`text-sm ${className || ''}`}>
                    {children}
                  </code>
                </pre>
              </div>
            );
          },
          
          // 表格
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-gray-300">
                {children}
              </table>
            </div>
          ),
          
          th: ({ children }) => (
            <th className="border border-gray-300 bg-gray-50 px-4 py-2 text-left font-semibold">
              {children}
            </th>
          ),
          
          td: ({ children }) => (
            <td className="border border-gray-300 px-4 py-2">
              {children}
            </td>
          ),
          
          // 列表
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>
          ),
          
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>
          ),
          
          // 引用块
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 bg-blue-50 pl-4 py-2 my-4 italic text-gray-700">
              {children}
            </blockquote>
          ),
          
          // 标题
          h1: ({ children }) => (
            <h1 className="text-xl font-bold mt-6 mb-3 text-gray-900">{children}</h1>
          ),
          
          h2: ({ children }) => (
            <h2 className="text-lg font-bold mt-5 mb-2 text-gray-900">{children}</h2>
          ),
          
          h3: ({ children }) => (
            <h3 className="text-base font-bold mt-4 mb-2 text-gray-900">{children}</h3>
          ),
          
          // 段落
          p: ({ children }) => (
            <p className="mb-3 leading-7">{children}</p>
          ),
          
          // 链接
          a: ({ href, children }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
      
      {/* 流式输入光标 */}
      {isStreaming && (
        <span className="inline-block w-2 h-5 ml-1 bg-gray-400 animate-pulse rounded-sm" />
      )}
    </div>
  );
}
