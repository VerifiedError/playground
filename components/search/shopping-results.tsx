'use client'

/**
 * Shopping Search Results Component
 *
 * Displays product listings with prices and ratings.
 */

import { ExternalLink, Star, ShoppingCart } from 'lucide-react'
import type { ShoppingSearchResponse } from '@/lib/serper-types'

interface ShoppingResultsProps {
  data: ShoppingSearchResponse
}

export function ShoppingResults({ data }: ShoppingResultsProps) {
  if (!data.shopping || data.shopping.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No products found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {data.shopping.map((product, index) => (
        <ProductCard key={index} product={product} />
      ))}
    </div>
  )
}

function ProductCard({ product }: { product: any }) {
  return (
    <a
      href={product.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-white border-2 border-black rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Product Image */}
      <div className="relative aspect-square bg-gray-100">
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={product.title}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingCart className="h-16 w-16 text-gray-300" />
          </div>
        )}

        {/* Position Badge */}
        {product.position && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-black text-white text-xs font-medium rounded">
            #{product.position}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 line-clamp-2 min-h-[48px]">
          {product.title}
        </h3>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium text-gray-900">{product.rating}</span>
            </div>
            {product.ratingCount && (
              <span className="text-xs text-gray-600">
                ({product.ratingCount.toLocaleString()})
              </span>
            )}
          </div>
        )}

        {/* Price */}
        {product.price && (
          <div className="mt-3">
            <p className="text-2xl font-bold text-gray-900">{product.price}</p>
          </div>
        )}

        {/* Source */}
        {product.source && (
          <p className="text-sm text-gray-600 mt-2">{product.source}</p>
        )}

        {/* Delivery */}
        {product.delivery && (
          <p className="text-sm text-gray-600 mt-1">{product.delivery}</p>
        )}

        {/* Link */}
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-3">
          <ExternalLink className="h-3 w-3" />
          {new URL(product.link).hostname}
        </div>
      </div>
    </a>
  )
}
