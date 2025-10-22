'use client'

/**
 * Places Search Results Component
 *
 * Displays local business and place results.
 */

import { MapPin, Star, Phone, Globe, Navigation, ExternalLink } from 'lucide-react'
import type { PlacesSearchResponse } from '@/lib/serper-types'

interface PlacesResultsProps {
  data: PlacesSearchResponse
}

export function PlacesResults({ data }: PlacesResultsProps) {
  if (!data.places || data.places.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No places found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {data.places.map((place, index) => (
        <PlaceCard key={index} place={place} />
      ))}
    </div>
  )
}

function PlaceCard({ place }: { place: any }) {
  return (
    <div className="bg-white border-2 border-black rounded-lg p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900">{place.title}</h3>
          {place.category && (
            <p className="text-sm text-gray-600 mt-1">{place.category}</p>
          )}
        </div>

        {place.position && (
          <div className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
            #{place.position}
          </div>
        )}
      </div>

      {/* Rating */}
      {place.rating && (
        <div className="flex items-center gap-2 mt-3">
          <div className="flex items-center gap-1">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            <span className="font-semibold text-gray-900">{place.rating}</span>
          </div>
          {place.ratingCount && (
            <span className="text-sm text-gray-600">
              ({place.ratingCount.toLocaleString()} reviews)
            </span>
          )}
        </div>
      )}

      {/* Address */}
      {place.address && (
        <div className="flex items-start gap-2 mt-3 text-gray-700">
          <MapPin className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{place.address}</span>
        </div>
      )}

      {/* Contact Info */}
      <div className="space-y-2 mt-4">
        {place.phoneNumber && (
          <a
            href={`tel:${place.phoneNumber}`}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <Phone className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{place.phoneNumber}</span>
          </a>
        )}

        {place.website && (
          <a
            href={place.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <Globe className="h-4 w-4 text-gray-500" />
            <span className="text-sm truncate">{new URL(place.website).hostname}</span>
            <ExternalLink className="h-3 w-3 text-gray-400" />
          </a>
        )}
      </div>

      {/* Get Directions */}
      {place.latitude && place.longitude && (
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 w-full px-4 py-2 bg-black text-white hover:bg-gray-800 border-2 border-black rounded-lg transition-colors flex items-center justify-center gap-2 min-h-[44px]"
        >
          <Navigation className="h-4 w-4" />
          Get Directions
        </a>
      )}
    </div>
  )
}
