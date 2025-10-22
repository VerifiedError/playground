'use client'

/**
 * Scholar Search Results Component
 *
 * Displays academic papers and research articles.
 */

import { ExternalLink, FileText, Quote } from 'lucide-react'
import type { ScholarSearchResponse } from '@/lib/serper-types'

interface ScholarResultsProps {
  data: ScholarSearchResponse
}

export function ScholarResults({ data }: ScholarResultsProps) {
  if (!data.organic || data.organic.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No scholarly articles found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {data.organic.map((article, index) => (
        <ScholarCard key={index} article={article} />
      ))}
    </div>
  )
}

function ScholarCard({ article }: { article: any }) {
  return (
    <div className="bg-white border-2 border-black rounded-lg p-6 hover:shadow-lg transition-shadow">
      {/* Title */}
      <a
        href={article.link}
        target="_blank"
        rel="noopener noreferrer"
        className="group"
      >
        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-gray-700 group-hover:underline">
          {article.title}
        </h3>
      </a>

      {/* Authors and Publication */}
      <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-600">
        {article.authors && article.authors.length > 0 && (
          <span>{article.authors.join(', ')}</span>
        )}

        {article.publication && (
          <>
            <span>•</span>
            <span className="italic">{article.publication}</span>
          </>
        )}

        {article.year && (
          <>
            <span>•</span>
            <span>{article.year}</span>
          </>
        )}
      </div>

      {/* Snippet */}
      {article.snippet && (
        <p className="text-gray-700 mt-3 line-clamp-3">{article.snippet}</p>
      )}

      {/* Meta Info */}
      <div className="flex flex-wrap items-center gap-4 mt-4">
        {/* Citations */}
        {article.citedBy && article.citedBy > 0 && (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Quote className="h-4 w-4" />
            <span>Cited by {article.citedBy.toLocaleString()}</span>
          </div>
        )}

        {/* PDF Link */}
        {article.pdfLink && (
          <a
            href={article.pdfLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900 hover:underline"
          >
            <FileText className="h-4 w-4" />
            PDF
          </a>
        )}

        {/* Source Link */}
        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        >
          <ExternalLink className="h-3 w-3" />
          {new URL(article.link).hostname}
        </a>
      </div>
    </div>
  )
}
