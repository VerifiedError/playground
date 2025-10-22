/**
 * Mobile-aware toast notifications
 *
 * Disables toasts on mobile devices to prevent GUI breakage.
 * On mobile, toasts can overlap with fixed headers/footers and break layout.
 *
 * Usage:
 *   import { mobileToast } from '@/lib/mobile-toast'
 *   mobileToast.success('Message')  // Shows on desktop, hidden on mobile
 */

import { toast } from 'sonner'

/**
 * Detect if user is on mobile device
 */
function isMobile(): boolean {
  if (typeof window === 'undefined') return false

  // Check viewport width (mobile < 768px)
  const isMobileWidth = window.innerWidth < 768

  // Check user agent for mobile devices
  const isMobileAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )

  return isMobileWidth || isMobileAgent
}

/**
 * Mobile-aware toast wrapper
 * Disables toasts on mobile to prevent GUI issues
 */
export const mobileToast = {
  success: (message: string, data?: any) => {
    if (!isMobile()) {
      toast.success(message, data)
    }
    // On mobile: silently ignore (no toast shown)
  },

  error: (message: string, data?: any) => {
    if (!isMobile()) {
      toast.error(message, data)
    }
    // On mobile: silently ignore (no toast shown)
  },

  info: (message: string, data?: any) => {
    if (!isMobile()) {
      toast.info(message, data)
    }
    // On mobile: silently ignore (no toast shown)
  },

  warning: (message: string, data?: any) => {
    if (!isMobile()) {
      toast.warning(message, data)
    }
    // On mobile: silently ignore (no toast shown)
  },

  loading: (message: string, data?: any) => {
    if (!isMobile()) {
      return toast.loading(message, data)
    }
    // On mobile: return dummy toast ID
    return 'mobile-disabled'
  },

  dismiss: (toastId?: string | number) => {
    if (!isMobile() && toastId && toastId !== 'mobile-disabled') {
      toast.dismiss(toastId)
    }
  },
}
