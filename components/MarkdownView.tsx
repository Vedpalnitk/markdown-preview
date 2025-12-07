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
  const baseFont = 14; // Reduced from 16px for more compact view

  // Notion-inspired text colors
  const textPrimary = isDark ? 'text-white/90' : 'text-[#37352f]';
  const textSecondary = isDark ? 'text-white/60' : 'text-[#787774]';

  return (
    <div style={{ fontSize: `${(zoom / 100) * baseFont}px` }} className={`prose ${isDark ? 'prose-invert' : 'prose-slate'} max-w-none leading-normal
      ${textPrimary}
      prose-headings:font-semibold prose-headings:tracking-tight
      prose-h1:text-2xl prose-h1:mt-6 prose-h1:mb-3 prose-h1:font-bold
      prose-h2:text-xl prose-h2:mt-5 prose-h2:mb-2
      prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2
      prose-p:my-2 prose-p:leading-normal
      prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5
      ${isDark ? 'prose-li:marker:text-white/40' : 'prose-li:marker:text-[#787774]'}
      ${isDark ? 'prose-a:text-[#00E8FF]' : 'prose-a:text-[#0052CC]'} prose-a:no-underline hover:prose-a:underline
      prose-strong:font-semibold
      ${isDark ? 'prose-blockquote:border-[#00E8FF]/40' : 'prose-blockquote:border-[#0052CC]/30'} prose-blockquote:border-l-[3px] prose-blockquote:pl-4 prose-blockquote:not-italic prose-blockquote:bg-transparent
      prose-img:rounded-lg prose-img:shadow-sm
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
                className={`not-prose rounded-lg border my-4 ${
                  isDark
                    ? 'bg-[#1e1e1e] border-white/[0.08]'
                    : 'bg-[#f7f6f3] border-[#e8e5e0]'
                }`}
                codeTagProps={{
                  style: {
                    backgroundColor: 'transparent',
                    textShadow: 'none',
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                  }
                }}
                customStyle={{
                  margin: '0',
                  padding: '1rem',
                  background: 'transparent',
                  fontSize: '0.875em',
                  lineHeight: '1.7',
                }}
              >
                {String(codeContent).replace(/\n$/, '')}
              </SyntaxHighlighter>
            );
          },
          code({ className, children, ...props }: any) {
            return (
              <code
                className={`not-prose px-1.5 py-0.5 rounded font-mono text-[0.9em] font-normal
                  ${isDark
                    ? 'bg-white/[0.08] text-[#ff79c6]'
                    : 'bg-[#f7f6f3] text-[#eb5757]'
                  } ${className || ''}`}
                {...props}
              >
                {children}
              </code>
            );
          },
          // Notion-style tables
          table: ({ children, ...props }: any) => (
            <div className={`overflow-x-auto my-6 rounded-lg border ${
              isDark ? 'border-white/[0.08]' : 'border-[#e8e5e0]'
            }`}>
              <table className={`min-w-full ${
                isDark ? 'divide-white/[0.06]' : 'divide-[#e8e5e0]'
              }`} {...props}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }: any) => (
            <thead className={isDark ? 'bg-white/[0.04]' : 'bg-[#f7f6f3]'} {...props}>
              {children}
            </thead>
          ),
          tbody: ({ children, ...props }: any) => (
            <tbody className={`divide-y ${isDark ? 'divide-white/[0.06]' : 'divide-[#e8e5e0]'}`} {...props}>
              {children}
            </tbody>
          ),
          tr: ({ children, ...props }: any) => (
            <tr className={`transition-colors ${isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-[#f7f6f3]/50'}`} {...props}>
              {children}
            </tr>
          ),
          th: ({ children, ...props }: any) => (
            <th className={`px-4 py-3 text-left text-sm font-semibold ${
              isDark ? 'text-white/80' : 'text-[#37352f]'
            }`} {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }: any) => (
            <td className={`px-4 py-3 text-sm ${
              isDark ? 'text-white/70' : 'text-[#37352f]'
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
