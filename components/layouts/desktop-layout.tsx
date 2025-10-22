'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import { ResizableHandle } from '@/components/ui/resizable'

interface DesktopLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  rightPanel?: React.ReactNode
  header?: React.ReactNode
  showRightPanel?: boolean
}

/**
 * DesktopLayout - Three-panel layout for desktop with resizable sidebar
 *
 * Layout Structure:
 * ┌─────────────┬──────────────────┬─────────────┐
 * │   Sidebar   │     Header       │             │
 * │             ├──────────────────┤ Right Panel │
 * │   (Left)    │   Main Content   │  (Optional) │
 * │             │                  │             │
 * └─────────────┴──────────────────┴─────────────┘
 */
export function DesktopLayout({
  children,
  sidebar,
  rightPanel,
  header,
  showRightPanel = false,
}: DesktopLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <DesktopLayoutContent
        sidebar={sidebar}
        rightPanel={rightPanel}
        header={header}
        showRightPanel={showRightPanel}
      >
        {children}
      </DesktopLayoutContent>
    </SidebarProvider>
  )
}

function DesktopLayoutContent({
  children,
  sidebar,
  rightPanel,
  header,
  showRightPanel,
}: DesktopLayoutProps) {
  const { open, isMobile } = useSidebar()
  const [sidebarWidth, setSidebarWidth] = React.useState(280)
  const [rightPanelWidth, setRightPanelWidth] = React.useState(300)

  // Persist sidebar width to localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('sidebar-width')
    if (saved) {
      setSidebarWidth(parseInt(saved, 10))
    }
  }, [])

  const handleSidebarResize = (delta: number) => {
    setSidebarWidth((prev) => {
      const newWidth = Math.min(Math.max(prev + delta, 200), 500)
      localStorage.setItem('sidebar-width', newWidth.toString())
      return newWidth
    })
  }

  const handleRightPanelResize = (delta: number) => {
    setRightPanelWidth((prev) => Math.min(Math.max(prev - delta, 250), 450))
  }

  // Mobile layout (< 1024px) - No desktop layout, use existing mobile structure
  if (isMobile) {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        {children}
      </div>
    )
  }

  // Desktop layout (≥ 1024px) - Three-panel structure
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Left Sidebar */}
      {sidebar && (
        <Sidebar
          side="left"
          variant="sidebar"
          collapsible="icon"
          className="flex-shrink-0 h-screen"
          style={{ width: open ? sidebarWidth : 68 }}
        >
          {sidebar}
          {open && (
            <ResizableHandle
              onResize={handleSidebarResize}
              className="absolute right-0 top-0 h-full w-1.5"
            />
          )}
        </Sidebar>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        {header && (
          <header className="flex-shrink-0 border-b-2 border-black bg-white z-10">
            {header}
          </header>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>

      {/* Right Panel (Optional) */}
      {showRightPanel && rightPanel && (
        <aside
          className="flex-shrink-0 h-screen bg-white border-l-2 border-black overflow-hidden"
          style={{ width: rightPanelWidth }}
        >
          <ResizableHandle
            onResize={handleRightPanelResize}
            className="absolute left-0 top-0 h-full w-1.5"
          />
          {rightPanel}
        </aside>
      )}
    </div>
  )
}

/**
 * DesktopHeader - Header component with sidebar trigger and actions
 */
interface DesktopHeaderProps {
  children: React.ReactNode
  className?: string
}

export function DesktopHeader({ children, className }: DesktopHeaderProps) {
  return (
    <div className={cn('flex items-center gap-4 px-6 py-4', className)}>
      <SidebarTrigger />
      {children}
    </div>
  )
}

/**
 * DesktopMainContent - Main content area with proper overflow handling
 */
interface DesktopMainContentProps {
  children: React.ReactNode
  className?: string
}

export function DesktopMainContent({ children, className }: DesktopMainContentProps) {
  return (
    <div className={cn('h-full overflow-y-auto overflow-x-hidden', className)}>
      {children}
    </div>
  )
}
