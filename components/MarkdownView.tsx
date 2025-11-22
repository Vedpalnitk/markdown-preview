import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Theme } from '../types';

interface MarkdownViewProps {
  content: string;
  theme: Theme;
  zoom?: number;
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

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content, theme, zoom = 100 }) => {
  const isDark = theme === Theme.DARK;
  const processedContent = cleanupContent(content);
  const baseFont = 12; // base px for preview

  return (
    <div style={{ fontSize: `${(zoom / 100) * baseFont}px` }} className={`prose ${isDark ? 'prose-invert text-gray-100' : 'prose-slate text-[#001226]'} max-w-none leading-relaxed
      prose-headings:font-semibold prose-headings:mt-2 prose-headings:mb-2 prose-headings:tracking-tight
      prose-p:my-2 prose-p:leading-relaxed
      prose-ul:my-2 prose-ol:my-2 prose-li:marker:text-gray-400
      prose-a:text-[#00D4FF] prose-a:no-underline hover:prose-a:text-[#00FFFF]
      prose-strong:text-current prose-blockquote:border-l-[6px] prose-blockquote:border-[#00D4FF]/40 prose-blockquote:bg-white/5
      prose-img:rounded-[32px]
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
                style={isDark ? oneDark : oneLight}
                PreTag="div"
                className={`not-prose rounded-[32px] border shadow-sm my-8 backdrop-blur-md ${
                  isDark
                    ? 'bg-[rgba(0,18,38,0.65)] border-[#0d243c] shadow-[0_18px_36px_-24px_rgba(0,0,0,0.8)]'
                    : 'bg-[rgba(255,255,255,0.9)] border-[#E5E7EB] shadow-[0_18px_36px_-24px_rgba(0,82,204,0.18)]'
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
                    ? 'bg-white/10 text-[#00E8FF] border-[#0d243c]' 
                    : 'bg-[#F9FDFF] text-[#0052CC] border-[#E5E7EB] shadow-[0_10px_22px_-16px_rgba(0,82,204,0.35)]'
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
