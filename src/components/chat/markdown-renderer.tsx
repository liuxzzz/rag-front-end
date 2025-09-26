'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
}

export function MarkdownRenderer({ content, isStreaming }: MarkdownRendererProps) {

  return (
    <div className="prose prose-sm max-w-none text-gray-800">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
        components={{
          // 自定义代码块渲染
          code({ node, className, children, ...props }: any) {
            const inline = !className;
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            if (!inline && language) {
              return (
                <div className="relative group">
                  <div className="flex items-center justify-between bg-gray-100 px-4 py-2 text-xs text-gray-600 border-b">
                    <span className="font-medium">{language}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(String(children))}
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-gray-800"
                    >
                      复制
                    </button>
                  </div>
                  <pre className="!mt-0 !rounded-t-none">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              );
            }
            
            return (
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            );
          },
          
          // 自定义表格渲染
          table({ children }: any) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border-collapse border border-gray-300">
                  {children}
                </table>
              </div>
            );
          },
          
          th({ children }: any) {
            return (
              <th className="border border-gray-300 bg-gray-50 px-4 py-2 text-left font-semibold">
                {children}
              </th>
            );
          },
          
          td({ children }: any) {
            return (
              <td className="border border-gray-300 px-4 py-2">
                {children}
              </td>
            );
          },
          
          // 自定义列表渲染
          ul({ children }: any) {
            return <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>;
          },
          
          ol({ children }: any) {
            return <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>;
          },
          
          // 自定义引用块渲染
          blockquote({ children }: any) {
            return (
              <blockquote className="border-l-4 border-blue-500 bg-blue-50 pl-4 py-2 my-4 italic text-gray-700">
                {children}
              </blockquote>
            );
          },
          
          // 自定义标题渲染
          h1({ children }: any) {
            return <h1 className="text-xl font-bold mt-6 mb-3 text-gray-900">{children}</h1>;
          },
          
          h2({ children }: any) {
            return <h2 className="text-lg font-bold mt-5 mb-2 text-gray-900">{children}</h2>;
          },
          
          h3({ children }: any) {
            return <h3 className="text-base font-bold mt-4 mb-2 text-gray-900">{children}</h3>;
          },
          
          // 自定义段落渲染
          p({ children }: any) {
            return <p className="mb-3 leading-7">{children}</p>;
          },
          
          // 自定义链接渲染
          a({ href, children }: any) {
            return (
              <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                {children}
              </a>
            );
          },
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
