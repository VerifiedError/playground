'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Bot } from 'lucide-react'
import type { Components } from 'react-markdown'

interface AIMessageProps {
  content: string
}

export function AIMessage({ content }: AIMessageProps) {
  const components: Components = {
            // Headings
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold text-white mb-3 mt-4 first:mt-0 border-b border-slate-600 pb-2">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-bold text-white mb-2 mt-3 first:mt-0">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-semibold text-white mb-2 mt-3 first:mt-0">
                {children}
              </h3>
            ),
            h4: ({ children }) => (
              <h4 className="text-base font-semibold text-white mb-2 mt-2 first:mt-0">
                {children}
              </h4>
            ),

            // Paragraphs
            p: ({ children }) => (
              <p className="text-slate-200 mb-3 last:mb-0 leading-relaxed">
                {children}
              </p>
            ),

            // Lists
            ul: ({ children }) => (
              <ul className="list-disc list-inside space-y-1 mb-3 text-slate-200 ml-2">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside space-y-1 mb-3 text-slate-200 ml-2">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="text-slate-200 leading-relaxed">
                {children}
              </li>
            ),

            // Code blocks
            code: ({ inline, className, children, ...props }: any) => {
              const match = /language-(\w+)/.exec(className || '')
              const language = match ? match[1] : ''

              return !inline ? (
                <div className="my-3 rounded-lg overflow-hidden border border-slate-600">
                  {language && (
                    <div className="bg-slate-900 px-3 py-1 text-xs text-slate-400 border-b border-slate-600 font-mono">
                      {language}
                    </div>
                  )}
                  <pre className="bg-slate-950 p-3 overflow-x-auto">
                    <code className="text-sm text-slate-200 font-mono" {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              ) : (
                <code className="bg-slate-900 px-1.5 py-0.5 rounded text-sm text-purple-300 font-mono" {...props}>
                  {children}
                </code>
              )
            },

            // Blockquotes
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-purple-500 pl-4 my-3 italic text-slate-300 bg-slate-900/50 py-2">
                {children}
              </blockquote>
            ),

            // Links
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:text-sky-300 underline transition-colors"
              >
                {children}
              </a>
            ),

            // Tables
            table: ({ children }) => (
              <div className="my-3 overflow-x-auto rounded-lg border border-slate-600">
                <table className="min-w-full divide-y divide-slate-600">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-slate-900">
                {children}
              </thead>
            ),
            tbody: ({ children }) => (
              <tbody className="divide-y divide-slate-700 bg-slate-800/50">
                {children}
              </tbody>
            ),
            tr: ({ children }) => (
              <tr>{children}</tr>
            ),
            th: ({ children }) => (
              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-4 py-2 text-sm text-slate-200">
                {children}
              </td>
            ),

            // Horizontal rule
            hr: () => (
              <hr className="my-4 border-t border-slate-600" />
            ),

            // Strong/Bold
            strong: ({ children }) => (
              <strong className="font-bold text-white">
                {children}
              </strong>
            ),

            // Emphasis/Italic
            em: ({ children }) => (
              <em className="italic text-slate-200">
                {children}
              </em>
            ),

            // Strikethrough
            del: ({ children }) => (
              <del className="line-through text-slate-400">
                {children}
              </del>
            ),
  }

  return (
    <div className="flex gap-3 justify-start">
      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
        <Bot className="h-4 w-4 text-white" />
      </div>

      <div className="max-w-[80%] rounded-lg px-4 py-3 bg-slate-800 text-slate-100 border-2 border-slate-700">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={components}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
}
