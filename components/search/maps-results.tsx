'use client'

/**
 * Maps Search Results Component
 *
 * Displays map-based search results (similar to places).
 */

import { PlacesResults } from './places-results'
import type { MapsSearchResponse } from '@/lib/serper-types'

interface MapsResultsProps {
  data: MapsSearchResponse
}

export function MapsResults({ data }: MapsResultsProps) {
  // Maps and Places use the same result structure
  return <PlacesResults data={data as any} />
}
