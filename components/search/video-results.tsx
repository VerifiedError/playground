'use client'

/**
 * Video Search Results Component
 *
 * Displays video search results with thumbnails and metadata.
 */

import { ExternalLink, Play } from 'lucide-react'
import type { VideoSearchResponse } from '@/lib/serper-types'

interface VideoResultsProps {
  data: VideoSearchResponse
}

export function VideoResults({ data }: VideoResultsProps) {
  if (!data.videos || data.videos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No videos found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.videos.map((video, index) => (
        <VideoCard key={index} video={video} />
      ))}
    </div>
  )
}

function VideoCard({ video }: { video: any }) {
  return (
    <a
      href={video.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-white border-2 border-black rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-200">
        {video.thumbnail ? (
          <>
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity">
              <Play className="h-16 w-16 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="h-16 w-16 text-gray-400" />
          </div>
        )}

        {/* Duration Badge */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black text-white text-xs font-medium rounded">
            {video.duration}
          </div>
        )}

        {/* Platform Badge */}
        {video.platform && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-white text-black text-xs font-medium rounded border border-black">
            {video.platform}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 line-clamp-2">
          {video.title}
        </h3>

        {video.channel && (
          <p className="text-sm text-gray-600 mt-2">{video.channel}</p>
        )}

        <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
          {video.date && <span>{video.date}</span>}
          {video.views && <span>{video.views} views</span>}
        </div>

        {video.snippet && (
          <p className="text-sm text-gray-700 mt-2 line-clamp-2">{video.snippet}</p>
        )}

        <div className="flex items-center gap-1 text-sm text-gray-600 mt-3">
          <ExternalLink className="h-3 w-3" />
          {new URL(video.link).hostname}
        </div>
      </div>
    </a>
  )
}
