import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Theme } from '../types';

interface MarkdownViewProps {
  content: string;
  theme: Theme;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content, theme }) => {
  const syntaxStyle = theme === Theme.DARK ? oneDark : oneLight;
  const isDark = theme === Theme.DARK;

  return (
    <div className={`prose ${isDark ? 'prose-invert' : 'prose-slate'} max-w-none 
      prose-headings:font-semibold 
      prose-a:text-blue-500 
      prose-img:rounded-xl 
      prose-li:marker:text-gray-400
      prose-p:leading-relaxed
      prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0 prose-pre:border-0
      prose-code:before:content-none prose-code:after:content-none
    `}>
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // 1. Handle Code Blocks via the 'pre' tag
          // Markdown blocks are rendered as <pre><code>...</code></pre>
          pre: ({ children }) => {
            // We expect the child to be a <code> element
            const codeElement = React.isValidElement(children) ? (children as React.ReactElement<any>) : null;
            
            // Extract props from the nested <code> element
            const className = codeElement?.props?.className || '';
            const codeContent = codeElement?.props?.children || children; // Fallback to direct children if structure is odd
            const match = /language-(\w+)/.exec(className);
            const language = match ? match[1] : 'text';

            return (
              <SyntaxHighlighter
                style={syntaxStyle}
                language={language}
                PreTag="div"
                className={`not-prose rounded-xl border shadow-sm my-6 backdrop-blur-md ${
                  isDark 
                    ? 'bg-black/40 border-white/10' 
                    : 'bg-white/60 border-black/5'
                }`}
                codeTagProps={{
                  style: {
                    backgroundColor: 'transparent',
                    textShadow: 'none',
                    fontFamily: 'inherit',
                  }
                }}
                customStyle={{ 
                  margin: '0', 
                  padding: '1.25rem',
                  background: 'transparent',
                  fontSize: '0.9em',
                  lineHeight: '1.6',
                }}
              >
                {String(codeContent).replace(/\n$/, '')}
              </SyntaxHighlighter>
            );
          },

          // 2. Handle Inline Code via the 'code' tag
          // Since we intercept 'pre' above for blocks, this component is effectively
          // only responsible for styling inline code.
          code({ className, children, ...props }: any) {
            return (
              <code 
                className={`not-prose px-1.5 py-0.5 rounded-md font-mono text-sm font-medium border align-middle whitespace-pre-wrap break-words
                  ${isDark 
                    ? 'bg-white/10 text-sky-200 border-white/10' 
                    : 'bg-slate-100 text-pink-600 border-black/5'
                  } ${className || ''}`} 
                {...props}
              >
                {children}
              </code>
            );
          },
          
          // Table Styles
          table: ({ children }) => (
            <div className="overflow-x-auto my-8 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-gray-50 dark:bg-gray-900/50">{children}</thead>,
          th: ({ children }) => <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{children}</th>,
          td: ({ children }) => <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 border-t border-gray-100 dark:border-gray-800">{children}</td>
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};