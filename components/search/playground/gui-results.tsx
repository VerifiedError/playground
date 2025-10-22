'use client'

import type { SerperSearchType, SerperResponse } from '@/lib/serper-types'
import { WebResults } from '@/components/search/web-results'
import { ImageResults } from '@/components/search/image-results'
import { VideoResults } from '@/components/search/video-results'
import { PlacesResults } from '@/components/search/places-results'
import { MapsResults } from '@/components/search/maps-results'
import { NewsResults } from '@/components/search/news-results'
import { ScholarResults } from '@/components/search/scholar-results'
import { ShoppingResults } from '@/components/search/shopping-results'
import { LeakCheckResults } from '@/components/search/leakcheck-results'
import { Sparkles } from 'lucide-react'

interface GuiResultsProps {
  results: SerperResponse
  searchType: SerperSearchType
}

export function GuiResults({ results, searchType }: GuiResultsProps) {
  // Validate results before rendering
  if (!results || typeof results !== 'object') {
    return (
      <div className="p-6">
        <div className="max-w-5xl mx-auto text-center text-white">
          <p>No results to display</p>
        </div>
      </div>
    )
  }

  // Playground type shows in AI Chat tab (not Results tab)
  if (searchType === 'playground') {
    return (
      <div className="p-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Playground Mode
          </h3>
          <p className="text-slate-400 text-sm">
            Switch to the <span className="text-purple-400 font-medium">AI Chat</span> tab to start chatting with the AI.
          </p>
        </div>
      </div>
    )
  }

  // Compact wrapper for other search types
  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        {/* Route to appropriate result component with fallback for empty results */}
        {searchType === 'search' && (
          results.organic || results.answerBox || results.knowledgeGraph ? (
            <WebResults data={results as any} />
          ) : (
            <div className="text-white text-center">No web results found</div>
          )
        )}
        {searchType === 'images' && (
          results.images && results.images.length > 0 ? (
            <ImageResults data={results as any} />
          ) : (
            <div className="text-white text-center">No image results found</div>
          )
        )}
        {searchType === 'videos' && (
          results.videos && results.videos.length > 0 ? (
            <VideoResults data={results as any} />
          ) : (
            <div className="text-white text-center">No video results found</div>
          )
        )}
        {searchType === 'places' && (
          results.places && results.places.length > 0 ? (
            <PlacesResults data={results as any} />
          ) : (
            <div className="text-white text-center">No place results found</div>
          )
        )}
        {searchType === 'maps' && (
          results.places && results.places.length > 0 ? (
            <MapsResults data={results as any} />
          ) : (
            <div className="text-white text-center">No map results found</div>
          )
        )}
        {searchType === 'news' && (
          results.news && results.news.length > 0 ? (
            <NewsResults data={results as any} />
          ) : (
            <div className="text-white text-center">No news results found</div>
          )
        )}
        {searchType === 'scholar' && (
          results.organic && results.organic.length > 0 ? (
            <ScholarResults data={results as any} />
          ) : (
            <div className="text-white text-center">No scholar results found</div>
          )
        )}
        {searchType === 'shopping' && (
          results.shopping && results.shopping.length > 0 ? (
            <ShoppingResults data={results as any} />
          ) : (
            <div className="text-white text-center">No shopping results found</div>
          )
        )}
        {searchType === 'leakcheck' && (
          results.result ? (
            <LeakCheckResults data={results as any} />
          ) : (
            <div className="text-white text-center">No breach data found</div>
          )
        )}
      </div>
    </div>
  )
}
