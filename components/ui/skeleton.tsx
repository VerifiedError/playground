// Loading Skeleton Component
// Reusable skeleton for loading states

import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

/**
 * Base skeleton component with shimmer animation
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
      {...props}
    />
  )
}

/**
 * Session list item skeleton
 */
export function SessionSkeleton() {
  return (
    <div className="p-3 border-b border-border">
      <div className="flex items-start justify-between mb-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-3 w-1/2" />
    </div>
  )
}

/**
 * Message skeleton (user or assistant)
 */
export function MessageSkeleton({ isUser = false }: { isUser?: boolean }) {
  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />

      {/* Message content */}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  )
}

/**
 * Stats card skeleton (for analytics)
 */
export function StatsCardSkeleton() {
  return (
    <div className="border-2 border-black rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-3 w-24 mb-2" />
      <Skeleton className="h-8 w-32" />
    </div>
  )
}

/**
 * Table row skeleton
 */
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b border-border">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}

/**
 * Chart skeleton
 */
export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-48" />
      <Skeleton className={`w-full`} style={{ height: `${height}px` }} />
    </div>
  )
}
