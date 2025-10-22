'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

// Context for sidebar state management
interface SidebarContextValue {
  state: 'expanded' | 'collapsed'
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextValue | undefined>(undefined)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}

// SidebarProvider - Wraps the application and provides sidebar state
interface SidebarProviderProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
}

export function SidebarProvider({
  children,
  open: controlledOpen,
  onOpenChange,
  defaultOpen = true,
}: SidebarProviderProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const [openMobile, setOpenMobile] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)

  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = onOpenChange ?? setUncontrolledOpen

  // Detect mobile viewport
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile((prev) => !prev)
    } else {
      setOpen(!open)
    }
  }, [isMobile, open, setOpen])

  const state = open ? 'expanded' : 'collapsed'

  const value: SidebarContextValue = {
    state,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
  }

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  )
}

// Sidebar - Main sidebar container
interface SidebarProps extends React.ComponentPropsWithoutRef<'aside'> {
  side?: 'left' | 'right'
  variant?: 'sidebar' | 'floating' | 'inset'
  collapsible?: 'offcanvas' | 'icon' | 'none'
}

export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  ({ side = 'left', variant = 'sidebar', collapsible = 'offcanvas', className, children, ...props }, ref) => {
    const { isMobile, open, openMobile, setOpenMobile } = useSidebar()

    if (isMobile) {
      // Mobile: render as overlay
      return (
        <>
          {(openMobile) && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40 bg-black/50"
                onClick={() => setOpenMobile(false)}
              />
              {/* Sidebar */}
              <aside
                ref={ref}
                data-state={openMobile ? 'open' : 'closed'}
                className={cn(
                  'fixed z-50 h-screen w-[280px] bg-white border-r-2 border-black',
                  'transition-transform duration-300',
                  side === 'left' ? 'left-0' : 'right-0',
                  openMobile ? 'translate-x-0' : side === 'left' ? '-translate-x-full' : 'translate-x-full',
                  className
                )}
                {...props}
              >
                {children}
              </aside>
            </>
          )}
        </>
      )
    }

    // Desktop: render as persistent sidebar
    return (
      <aside
        ref={ref}
        data-state={open ? 'expanded' : 'collapsed'}
        data-collapsible={collapsible}
        className={cn(
          'relative h-screen bg-white border-r-2 border-black',
          'transition-all duration-300 ease-in-out',
          open ? 'w-[280px]' : collapsible === 'icon' ? 'w-[68px]' : 'w-0',
          variant === 'floating' && 'shadow-lg',
          variant === 'inset' && 'ml-2 mr-2 rounded-lg',
          className
        )}
        {...props}
      >
        {children}
      </aside>
    )
  }
)
Sidebar.displayName = 'Sidebar'

// SidebarTrigger - Button to toggle sidebar
interface SidebarTriggerProps extends React.ComponentPropsWithoutRef<'button'> {}

export const SidebarTrigger = React.forwardRef<HTMLButtonElement, SidebarTriggerProps>(
  ({ className, ...props }, ref) => {
    const { toggleSidebar } = useSidebar()

    return (
      <button
        ref={ref}
        type="button"
        onClick={toggleSidebar}
        className={cn(
          'inline-flex items-center justify-center p-2',
          'hover:bg-gray-100 rounded-lg transition-colors',
          'min-h-[44px] min-w-[44px]',
          className
        )}
        {...props}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M9 3v18" />
        </svg>
        <span className="sr-only">Toggle Sidebar</span>
      </button>
    )
  }
)
SidebarTrigger.displayName = 'SidebarTrigger'

// SidebarHeader - Sticky header section
interface SidebarHeaderProps extends React.ComponentPropsWithoutRef<'div'> {}

export const SidebarHeader = React.forwardRef<HTMLDivElement, SidebarHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col gap-2 p-4 border-b-2 border-black',
          className
        )}
        {...props}
      />
    )
  }
)
SidebarHeader.displayName = 'SidebarHeader'

// SidebarContent - Scrollable content area
interface SidebarContentProps extends React.ComponentPropsWithoutRef<'div'> {}

export const SidebarContent = React.forwardRef<HTMLDivElement, SidebarContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex-1 overflow-y-auto overflow-x-hidden',
          className
        )}
        {...props}
      />
    )
  }
)
SidebarContent.displayName = 'SidebarContent'

// SidebarFooter - Sticky footer section
interface SidebarFooterProps extends React.ComponentPropsWithoutRef<'div'> {}

export const SidebarFooter = React.forwardRef<HTMLDivElement, SidebarFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col gap-2 p-4 border-t-2 border-black',
          className
        )}
        {...props}
      />
    )
  }
)
SidebarFooter.displayName = 'SidebarFooter'

// SidebarGroup - Group of related items
interface SidebarGroupProps extends React.ComponentPropsWithoutRef<'div'> {}

export const SidebarGroup = React.forwardRef<HTMLDivElement, SidebarGroupProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col gap-2 p-4', className)}
        {...props}
      />
    )
  }
)
SidebarGroup.displayName = 'SidebarGroup'

// SidebarGroupLabel - Label for a group
interface SidebarGroupLabelProps extends React.ComponentPropsWithoutRef<'div'> {}

export const SidebarGroupLabel = React.forwardRef<HTMLDivElement, SidebarGroupLabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'text-xs font-semibold text-gray-600 uppercase tracking-wide px-2 py-1',
          className
        )}
        {...props}
      />
    )
  }
)
SidebarGroupLabel.displayName = 'SidebarGroupLabel'

// SidebarGroupContent - Content wrapper for group
interface SidebarGroupContentProps extends React.ComponentPropsWithoutRef<'div'> {}

export const SidebarGroupContent = React.forwardRef<HTMLDivElement, SidebarGroupContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col gap-1', className)}
        {...props}
      />
    )
  }
)
SidebarGroupContent.displayName = 'SidebarGroupContent'

// SidebarMenu - Menu container
interface SidebarMenuProps extends React.ComponentPropsWithoutRef<'ul'> {}

export const SidebarMenu = React.forwardRef<HTMLUListElement, SidebarMenuProps>(
  ({ className, ...props }, ref) => {
    return (
      <ul
        ref={ref}
        className={cn('flex flex-col gap-1', className)}
        {...props}
      />
    )
  }
)
SidebarMenu.displayName = 'SidebarMenu'

// SidebarMenuItem - Individual menu item
interface SidebarMenuItemProps extends React.ComponentPropsWithoutRef<'li'> {}

export const SidebarMenuItem = React.forwardRef<HTMLLIElement, SidebarMenuItemProps>(
  ({ className, ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={cn('list-none', className)}
        {...props}
      />
    )
  }
)
SidebarMenuItem.displayName = 'SidebarMenuItem'

// SidebarMenuButton - Button within menu item
interface SidebarMenuButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  asChild?: boolean
  isActive?: boolean
}

export const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ className, isActive, children, asChild, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : 'button'

    const buttonClasses = cn(
      'flex items-center gap-3 w-full px-3 py-2 text-sm',
      'rounded-lg transition-colors min-h-[44px]',
      'hover:bg-gray-100',
      isActive && 'bg-gray-100 font-medium',
      !asChild && 'text-left',
      className
    )

    if (asChild) {
      return (
        <div className={buttonClasses}>
          {children}
        </div>
      )
    }

    return (
      <button
        ref={ref}
        className={buttonClasses}
        {...props}
      >
        {children}
      </button>
    )
  }
)
SidebarMenuButton.displayName = 'SidebarMenuButton'

// SidebarSeparator - Visual separator
interface SidebarSeparatorProps extends React.ComponentPropsWithoutRef<'div'> {}

export const SidebarSeparator = React.forwardRef<HTMLDivElement, SidebarSeparatorProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('h-[2px] bg-black my-2', className)}
        {...props}
      />
    )
  }
)
SidebarSeparator.displayName = 'SidebarSeparator'

// SidebarRail - Resize handle
interface SidebarRailProps extends React.ComponentPropsWithoutRef<'div'> {}

export const SidebarRail = React.forwardRef<HTMLDivElement, SidebarRailProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'absolute right-0 top-0 h-full w-1 cursor-col-resize',
          'hover:bg-gray-300 transition-colors',
          className
        )}
        {...props}
      />
    )
  }
)
SidebarRail.displayName = 'SidebarRail'

// SidebarInset - Content area when using inset variant
interface SidebarInsetProps extends React.ComponentPropsWithoutRef<'div'> {}

export const SidebarInset = React.forwardRef<HTMLDivElement, SidebarInsetProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex-1 flex flex-col overflow-hidden', className)}
        {...props}
      />
    )
  }
)
SidebarInset.displayName = 'SidebarInset'
