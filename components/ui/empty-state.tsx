// Empty State Component
// Displays helpful messages when there's no content

import { MessageSquare, Search, FileText, AlertCircle } from 'lucide-react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

/**
 * Base empty state component
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      {icon && (
        <div className="mb-4 text-muted-foreground opacity-40">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4 max-w-md">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

/**
 * No sessions empty state
 */
export function NoSessionsState({ onCreateSession }: { onCreateSession: () => void }) {
  return (
    <EmptyState
      icon={<MessageSquare className="h-16 w-16" />}
      title="No sessions yet"
      description="Start a new conversation to get started. Your sessions will appear here."
      action={{
        label: 'New Session',
        onClick: onCreateSession,
      }}
    />
  )
}

/**
 * No messages empty state (welcome message)
 */
export function NoMessagesState({ sessionName }: { sessionName?: string }) {
  return (
    <EmptyState
      icon={<MessageSquare className="h-16 w-16" />}
      title={sessionName ? `Welcome to ${sessionName}` : 'Start a conversation'}
      description="Type a message below to begin chatting with the AI assistant. You can ask questions, request code, or have a natural conversation."
    />
  )
}

/**
 * No search results empty state
 */
export function NoSearchResultsState({ query }: { query: string }) {
  return (
    <EmptyState
      icon={<Search className="h-16 w-16" />}
      title="No results found"
      description={`No sessions or messages match "${query}". Try a different search term or clear your filters.`}
    />
  )
}

/**
 * No templates empty state
 */
export function NoTemplatesState({ onCreateTemplate }: { onCreateTemplate: () => void }) {
  return (
    <EmptyState
      icon={<FileText className="h-16 w-16" />}
      title="No templates yet"
      description="Save a session as a template to reuse it later. Templates help you quickly start conversations with pre-configured settings."
      action={{
        label: 'Save Current Session',
        onClick: onCreateTemplate,
      }}
    />
  )
}

/**
 * Error state
 */
export function ErrorState({
  title = 'Something went wrong',
  description = 'An error occurred while loading this content. Please try again.',
  onRetry,
}: {
  title?: string
  description?: string
  onRetry?: () => void
}) {
  return (
    <EmptyState
      icon={<AlertCircle className="h-16 w-16 text-red-500" />}
      title={title}
      description={description}
      action={
        onRetry
          ? {
              label: 'Try Again',
              onClick: onRetry,
            }
          : undefined
      }
    />
  )
}
