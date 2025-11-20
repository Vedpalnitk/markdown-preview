import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { Theme } from '../types';

interface MarkdownViewProps {
  content: string;
  theme: Theme;
}

// Helper to clean up raw text before markdown parsing
const cleanupContent = (text: string): string => {
  if (!text) return '';
  
  let cleaned = text;

  // 1. Fix Form Feed (\f) appearing as \x0c
  cleaned = cleaned.replace(/\x0c/g, '\\f');

  // 2. Auto-wrap LaTeX environments that might be missing delimiters
  cleaned = cleaned.replace(
    /(\\begin\{(equation|align|gather|alignat|eqnarray)\}[\s\S]*?\\end\{\2\})/gm, 
    (match) => {
      return `$$\n${match}\n$$`;
    }
  );

  // 3. Heuristic: If a line starts with a LaTeX command like \frac, \sqrt, wrap it in $$
  cleaned = cleaned.replace(/^\\(frac|sqrt|sum|int|vec|mathbf|mathcal).*$/gm, '$$$&$$');

  return cleaned;
};

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content, theme }) => {
  const isDark = theme === Theme.DARK;
  const processedContent = cleanupContent(content);

  return (
    <div className={`prose ${isDark ? 'prose-invert' : 'prose-slate'} max-w-none 
      prose-headings:font-semibold 
      prose-a:text-blue-500 
      prose-img:rounded-[32px] 
      prose-li:marker:text-gray-400
      prose-p:leading-relaxed
      prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0 prose-pre:border-0
      prose-code:before:content-none prose-code:after:content-none
    `}>
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[
          rehypeRaw,
          [rehypeKatex, { 
            throwOnError: false, 
            strict: false,
            trust: true,
            output: 'html' // Force HTML output to use the KaTeX CSS
          }]
        ]}
        components={{
          pre: ({ children }) => {
            const codeElement = React.isValidElement(children) ? (children as React.ReactElement<any>) : null;
            const className = codeElement?.props?.className || '';
            const codeContent = codeElement?.props?.children || children;
            const match = /language-(\w+)/.exec(className);
            const language = match ? match[1] : 'text';

            return (
              <SyntaxHighlighter
                language={language}
                PreTag="div"
                className={`not-prose rounded-[32px] border shadow-sm my-8 backdrop-blur-md ${
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
                  padding: '1.5rem',
                  background: 'transparent',
                  fontSize: '0.9em',
                  lineHeight: '1.6',
                }}
              >
                {String(codeContent).replace(/\n$/, '')}
              </SyntaxHighlighter>
            );
          },
          code({ className, children, ...props }: any) {
            return (
              <code 
                className={`not-prose px-2 py-1 rounded-xl font-mono text-sm font-medium border align-middle whitespace-pre-wrap break-words
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
          table: ({ children, ...props }: any) => (
            <div className={`overflow-x-auto my-10 rounded-[32px] border shadow-sm ${
              isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
            }`}>
              <table className={`min-w-full divide-y ${
                isDark ? 'divide-white/10' : 'divide-gray-200'
              }`} {...props}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }: any) => (
            <thead className={isDark ? 'bg-white/10' : 'bg-gray-50'} {...props}>
              {children}
            </thead>
          ),
          tbody: ({ children, ...props }: any) => (
            <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-gray-100'}`} {...props}>
              {children}
            </tbody>
          ),
          tr: ({ children, ...props }: any) => (
            <tr className={`transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`} {...props}>
              {children}
            </tr>
          ),
          th: ({ children, ...props }: any) => (
            <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${
              isDark ? 'text-white' : 'text-gray-500'
            }`} {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }: any) => (
            <td className={`px-6 py-4 text-sm border-t ${
              isDark ? 'text-gray-200 border-white/5' : 'text-gray-700 border-gray-100'
            }`} {...props}>
              {children}
            </td>
          )
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};