'use client'

/**
 * Image Search Results Component
 *
 * Displays image search results in a masonry grid.
 */

import { useState } from 'react'
import { ExternalLink, X } from 'lucide-react'
import type { ImageSearchResponse } from '@/lib/serper-types'

interface ImageResultsProps {
  data: ImageSearchResponse
}

export function ImageResults({ data }: ImageResultsProps) {
  const [selectedImage, setSelectedImage] = useState<any | null>(null)

  if (!data.images || data.images.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No images found</p>
      </div>
    )
  }

  return (
    <>
      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(image)}
            className="group relative aspect-square bg-white border-2 border-black rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            <img
              src={image.thumbnailUrl}
              alt={image.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity" />
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-white text-xs truncate">{image.title}</p>
              <p className="text-gray-300 text-xs truncate">{image.domain}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              aria-label="Close"
            >
              <X className="h-8 w-8" />
            </button>

            <div className="bg-white border-2 border-black rounded-lg overflow-hidden">
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.title}
                className="w-full max-h-[70vh] object-contain"
              />
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-lg">{selectedImage.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedImage.domain}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                  <span>{selectedImage.imageWidth} × {selectedImage.imageHeight}</span>
                  <a
                    href={selectedImage.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-gray-900 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View original
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
