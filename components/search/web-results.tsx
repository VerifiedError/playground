'use client'

/**
 * Web Search Results Component
 *
 * Displays organic search results, knowledge graph, answer box, and related searches.
 */

import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import type { WebSearchResponse } from '@/lib/serper-types'

interface WebResultsProps {
  data: WebSearchResponse
}

export function WebResults({ data }: WebResultsProps) {
  if (!data.organic || data.organic.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No results found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Answer Box */}
      {data.answerBox && (
        <div className="bg-white border-2 border-black rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{data.answerBox.title}</h3>
          <p className="text-gray-700">{data.answerBox.snippet}</p>
          {data.answerBox.link && (
            <a
              href={data.answerBox.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-gray-900 mt-2 inline-flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              Source
            </a>
          )}
        </div>
      )}

      {/* Knowledge Graph */}
      {data.knowledgeGraph && (
        <div className="bg-white border-2 border-black rounded-lg p-6">
          <div className="flex gap-4">
            {data.knowledgeGraph.imageUrl && (
              <img
                src={data.knowledgeGraph.imageUrl}
                alt={data.knowledgeGraph.title}
                className="w-32 h-32 object-cover rounded-lg border-2 border-black"
              />
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{data.knowledgeGraph.title}</h2>
              {data.knowledgeGraph.type && (
                <p className="text-sm text-gray-600 mt-1">{data.knowledgeGraph.type}</p>
              )}
              {data.knowledgeGraph.description && (
                <p className="text-gray-700 mt-3">{data.knowledgeGraph.description}</p>
              )}
              {data.knowledgeGraph.attributes && (
                <dl className="mt-4 space-y-2">
                  {Object.entries(data.knowledgeGraph.attributes).slice(0, 5).map(([key, value]) => (
                    <div key={key} className="flex gap-2 text-sm">
                      <dt className="font-medium text-gray-900 min-w-[100px]">{key}:</dt>
                      <dd className="text-gray-700">{value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Organic Results */}
      <div className="space-y-4">
        {data.organic.map((result, index) => (
          <WebResult key={index} result={result} />
        ))}
      </div>

      {/* People Also Ask */}
      {data.peopleAlsoAsk && data.peopleAlsoAsk.length > 0 && (
        <div className="bg-white border-2 border-black rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">People also ask</h3>
          <div className="space-y-3">
            {data.peopleAlsoAsk.map((item, index) => (
              <PeopleAlsoAskItem key={index} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Related Searches */}
      {data.relatedSearches && data.relatedSearches.length > 0 && (
        <div className="bg-white border-2 border-black rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Related searches</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {data.relatedSearches.map((search, index) => (
              <button
                key={index}
                className="px-4 py-2 text-left text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors"
              >
                {search.query}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function WebResult({ result }: { result: any }) {
  return (
    <div className="bg-white border-2 border-black rounded-lg p-4 hover:shadow-md transition-shadow">
      <a
        href={result.link}
        target="_blank"
        rel="noopener noreferrer"
        className="group"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:underline">
              {result.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{new URL(result.link).hostname}</p>
          </div>
          <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
        </div>
        {result.snippet && (
          <p className="text-gray-700 mt-2 line-clamp-3">{result.snippet}</p>
        )}
      </a>

      {/* Sitelinks */}
      {result.sitelinks && result.sitelinks.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-2">
          {result.sitelinks.slice(0, 4).map((sitelink: any, index: number) => (
            <a
              key={index}
              href={sitelink.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-700 hover:text-gray-900 hover:underline truncate"
            >
              {sitelink.title}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

function PeopleAlsoAskItem({ item }: { item: any }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-gray-300 rounded-lg">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left text-gray-900 hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium">{item.question}</span>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
        )}
      </button>
      {expanded && (
        <div className="px-4 pb-3 text-gray-700 border-t border-gray-200">
          <p className="mt-2">{item.snippet}</p>
          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-gray-900 mt-2 inline-flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              {item.title}
            </a>
          )}
        </div>
      )}
    </div>
  )
}
