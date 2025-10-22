'use client'

import { User } from 'lucide-react'

interface UserMessageProps {
  content: string
}

export function UserMessage({ content }: UserMessageProps) {
  return (
    <div className="flex gap-3 justify-end">
      <div className="max-w-[80%] rounded-lg px-4 py-3 bg-sky-600 text-white">
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{content}</p>
      </div>

      <div className="flex-shrink-0 w-8 h-8 bg-sky-600 rounded-full flex items-center justify-center">
        <User className="h-4 w-4 text-white" />
      </div>
    </div>
  )
}
