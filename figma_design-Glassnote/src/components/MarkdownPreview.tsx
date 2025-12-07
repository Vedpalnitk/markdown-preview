import { Theme } from '../App';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownPreviewProps {
  content: string;
  theme: Theme;
}

export function MarkdownPreview({ content, theme }: MarkdownPreviewProps) {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none prose-lg">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-slate-100 border-b border-slate-800 pb-2" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-slate-200 border-b border-slate-800/50 pb-1" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-slate-200" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-slate-300" {...props} />
          ),
          h5: ({ node, ...props }) => (
            <h5 className="text-slate-300" {...props} />
          ),
          h6: ({ node, ...props }) => (
            <h6 className="text-slate-300" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="text-slate-300 leading-relaxed" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a className="text-blue-400 hover:text-blue-300 hover:underline" {...props} />
          ),
          code: ({ node, inline, ...props }: any) =>
            inline ? (
              <code className="bg-slate-800/60 px-1.5 py-0.5 rounded text-blue-300 border border-slate-700/50" {...props} />
            ) : (
              <code className="block text-slate-200" {...props} />
            ),
          pre: ({ node, ...props }) => (
            <pre className="bg-slate-900/80 border border-slate-800 p-4 rounded-lg overflow-x-auto" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-blue-600 bg-slate-900/40 pl-4 py-1 italic text-slate-400" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-outside ml-6 text-slate-300 space-y-1" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-outside ml-6 text-slate-300 space-y-1" {...props} />
          ),
          li: ({ node, children, ...props }: any) => {
            const content = String(children);
            // Check if this is a task list item
            if (content.includes('[ ]') || content.includes('[x]')) {
              const isChecked = content.includes('[x]');
              const text = content.replace(/\[[ x]\]\s*/, '');
              return (
                <li className="list-none flex items-start gap-2" {...props}>
                  <input 
                    type="checkbox" 
                    checked={isChecked} 
                    readOnly
                    className="mt-1 rounded border-slate-600 bg-slate-800"
                  />
                  <span className={isChecked ? 'line-through text-slate-500' : ''}>{text}</span>
                </li>
              );
            }
            return <li {...props}>{children}</li>;
          },
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full divide-y divide-slate-700 border border-slate-800" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-slate-900/60" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-2 text-left text-slate-200" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-2 border-t border-slate-800 text-slate-300" {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className="border-slate-800 my-6" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="text-slate-100" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="text-slate-300" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}