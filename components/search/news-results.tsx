'use client'

/**
 * News Search Results Component
 *
 * Displays news articles with images and publication info.
 */

import { ExternalLink, Calendar } from 'lucide-react'
import type { NewsSearchResponse } from '@/lib/serper-types'

interface NewsResultsProps {
  data: NewsSearchResponse
}

export function NewsResults({ data }: NewsResultsProps) {
  if (!data.news || data.news.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No news found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {data.news.map((article, index) => (
        <NewsCard key={index} article={article} />
      ))}
    </div>
  )
}

function NewsCard({ article }: { article: any }) {
  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white border-2 border-black rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="flex flex-col md:flex-row gap-4">
        {/* Thumbnail */}
        {article.imageUrl && (
          <div className="md:w-64 flex-shrink-0">
            <div className="aspect-video md:aspect-square relative overflow-hidden">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-4 md:p-6">
          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-gray-700 line-clamp-2">
            {article.title}
          </h3>

          {article.snippet && (
            <p className="text-gray-700 mt-2 line-clamp-3">{article.snippet}</p>
          )}

          <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
            {article.source && (
              <span className="font-medium text-gray-900">{article.source}</span>
            )}

            {article.date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {article.date}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-sm text-gray-600 mt-3">
            <ExternalLink className="h-3 w-3" />
            {new URL(article.link).hostname}
          </div>
        </div>
      </div>
    </a>
  )
}
