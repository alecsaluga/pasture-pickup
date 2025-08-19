'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Vendor, Location } from '@/types/vendor';
import { MapPin, Phone, Star, Navigation, Heart } from 'lucide-react';

interface VendorCardProps {
  vendor: Vendor;
  selectedLocation?: Location | null;
  calculateDistance: (lat1: number, lng1: number, lat2: number, lng2: number) => number;
  priority?: boolean;
}

export function VendorCard({ vendor, selectedLocation, calculateDistance, priority = false }: VendorCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
      {/* Vendor Image */}
      <div className="relative h-48 bg-gradient-to-br from-slate-100 to-blue-100">
        {vendor.featuredImage && vendor.featuredImage.trim() !== '' ? (
          <Image
            src={vendor.featuredImage}
            alt={`${vendor.name} - Professional livestock removal services`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyiwv1NeOdAIE7EvdXJfON5G5mFqPjA/9k="
            onError={(e) => {
              // Hide image and show fallback
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.parentElement?.querySelector('.image-fallback');
              if (fallback) {
                (fallback as HTMLElement).style.display = 'flex';
              }
            }}
          />
        ) : null}
        
        {/* Fallback placeholder - always present but hidden when image loads */}
        <div className={`image-fallback w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 ${vendor.featuredImage && vendor.featuredImage.trim() !== '' ? 'hidden' : 'flex'}`}>
          <div className="text-center">
            <div className="text-5xl mb-2 opacity-50">🚛</div>
            <div className="text-sm text-gray-500 font-medium">{vendor.name}</div>
          </div>
        </div>
        
        
        {/* Heart Icon */}
        <button className="absolute top-3 right-3 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white active:bg-gray-100 transition-colors touch-manipulation group/heart">
          <Heart className="w-5 h-5 text-gray-600 group-hover/heart:text-red-500 transition-colors" />
        </button>
      </div>

      {/* Card Content */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{vendor.name}</h3>
          <div className="flex items-center space-x-1 text-yellow-400">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm text-gray-600">4.8</span>
          </div>
        </div>
        
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="text-sm">{vendor.city}, {vendor.stateCode}</span>
          {selectedLocation && vendor.latitude && vendor.longitude && (
            <span className="text-sm ml-auto text-[#0a3b3d] font-medium">
              {Math.round(calculateDistance(
                selectedLocation.lat,
                selectedLocation.lng,
                vendor.latitude,
                vendor.longitude
              ))} mi
            </span>
          )}
        </div>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{vendor.description}</p>
        
        {/* Services Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {vendor.serviceTypes.slice(0, 2).map(service => (
            <span key={service} className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#f0fdfd', color: '#0a3b3d' }}>
              {service.replace(' Removal', '')}
            </span>
          ))}
          {vendor.serviceTypes.length > 2 && (
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
              +{vendor.serviceTypes.length - 2} more
            </span>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-2">
          <a
            href={`tel:${vendor.phone}`}
            className="w-full text-white py-3 px-4 rounded-xl font-semibold text-center flex items-center justify-center space-x-2 transition-colors min-h-[48px] touch-manipulation"
            style={{ backgroundColor: '#0a3b3d' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#083234'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0a3b3d'}
            onClick={() => {
              if (typeof window !== 'undefined' && window.gtag) {
                window.gtag('event', 'vendor_contact', {
                  vendor_name: vendor.name,
                  contact_method: 'phone',
                  location: `${vendor.city}, ${vendor.stateCode}`
                });
              }
            }}
          >
            <Phone className="w-5 h-5" />
            <span>Call Now: {vendor.phone}</span>
          </a>
          
          <Link
            href={`/vendor/${vendor.id}`}
            className="w-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg text-center font-medium transition-colors min-h-[44px] flex items-center justify-center touch-manipulation"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}