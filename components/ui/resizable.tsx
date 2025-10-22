'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

// ResizablePanel - A panel that can be resized
interface ResizablePanelProps extends React.ComponentPropsWithoutRef<'div'> {
  defaultSize?: number
  minSize?: number
  maxSize?: number
  collapsible?: boolean
}

export const ResizablePanel = React.forwardRef<HTMLDivElement, ResizablePanelProps>(
  ({ className, defaultSize = 280, minSize = 200, maxSize = 500, children, ...props }, ref) => {
    const [size, setSize] = React.useState(defaultSize)

    return (
      <div
        ref={ref}
        style={{ width: size }}
        className={cn('relative flex-shrink-0 transition-all duration-200', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ResizablePanel.displayName = 'ResizablePanel'

// ResizableHandle - Handle for resizing panels
interface ResizableHandleProps extends React.ComponentPropsWithoutRef<'div'> {
  onResize?: (delta: number) => void
}

export const ResizableHandle = React.forwardRef<HTMLDivElement, ResizableHandleProps>(
  ({ className, onResize, ...props }, ref) => {
    const [isDragging, setIsDragging] = React.useState(false)
    const startXRef = React.useRef(0)

    const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true)
      startXRef.current = e.clientX
      e.preventDefault()
    }

    React.useEffect(() => {
      if (!isDragging) return

      const handleMouseMove = (e: MouseEvent) => {
        const delta = e.clientX - startXRef.current
        startXRef.current = e.clientX
        onResize?.(delta)
      }

      const handleMouseUp = () => {
        setIsDragging(false)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }, [isDragging, onResize])

    return (
      <div
        ref={ref}
        onMouseDown={handleMouseDown}
        className={cn(
          'absolute right-0 top-0 h-full w-1.5 cursor-col-resize group',
          'hover:bg-gray-300 transition-colors',
          isDragging && 'bg-gray-400',
          className
        )}
        {...props}
      >
        <div className={cn(
          'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
          'h-8 w-1 bg-gray-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity',
          isDragging && 'opacity-100'
        )} />
      </div>
    )
  }
)
ResizableHandle.displayName = 'ResizableHandle'

// ResizablePanelGroup - Container for resizable panels
interface ResizablePanelGroupProps extends React.ComponentPropsWithoutRef<'div'> {
  direction?: 'horizontal' | 'vertical'
}

export const ResizablePanelGroup = React.forwardRef<HTMLDivElement, ResizablePanelGroupProps>(
  ({ className, direction = 'horizontal', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex h-full',
          direction === 'horizontal' ? 'flex-row' : 'flex-col',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ResizablePanelGroup.displayName = 'ResizablePanelGroup'
