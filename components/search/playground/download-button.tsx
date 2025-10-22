'use client'

import { Download } from 'lucide-react'
import { toast } from 'sonner'

interface DownloadButtonProps {
  results: any
}

export function DownloadButton({ results }: DownloadButtonProps) {
  const handleDownload = () => {
    try {
      const jsonString = JSON.stringify(results, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `serper-results-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Downloaded JSON file')
    } catch (error) {
      toast.error('Failed to download')
    }
  }

  return (
    <button
      onClick={handleDownload}
      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 rounded-lg transition-colors flex items-center gap-2"
      title="Download JSON"
    >
      <Download className="h-4 w-4 text-slate-400" />
      <span className="text-sm text-slate-300 hidden sm:inline">Download</span>
    </button>
  )
}
