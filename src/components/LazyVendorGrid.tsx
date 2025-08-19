'use client';

import { useState, useEffect, useRef } from 'react';
import { Vendor, Location } from '@/types/vendor';
import { VendorCard } from './VendorCard';

interface LazyVendorGridProps {
  vendors: Vendor[];
  selectedLocation?: Location | null;
  className?: string;
  itemsPerPage?: number;
}

export function LazyVendorGrid({ vendors, selectedLocation, className = "", itemsPerPage = 8 }: LazyVendorGridProps) {
  const [visibleVendors, setVisibleVendors] = useState<Vendor[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  // Load initial vendors
  useEffect(() => {
    const initialVendors = vendors.slice(0, itemsPerPage);
    setVisibleVendors(initialVendors);
    setCurrentPage(1);
  }, [vendors, itemsPerPage]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && visibleVendors.length < vendors.length) {
          loadMoreVendors();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [visibleVendors.length, vendors.length, isLoading]);

  const loadMoreVendors = () => {
    if (isLoading || visibleVendors.length >= vendors.length) return;

    setIsLoading(true);
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const startIndex = (nextPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const newVendors = vendors.slice(startIndex, endIndex);
      
      setVisibleVendors(prev => [...prev, ...newVendors]);
      setCurrentPage(nextPage);
      setIsLoading(false);
    }, 500);
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 3959; // miles
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const toRad = (value: number): number => {
    return value * Math.PI / 180;
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {visibleVendors.map((vendor, index) => (
          <VendorCard
            key={vendor.id}
            vendor={vendor}
            selectedLocation={selectedLocation}
            calculateDistance={calculateDistance}
            priority={index < 4} // Prioritize first 4 images
          />
        ))}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0a3b3d]"></div>
            <span className="text-gray-600">Loading more providers...</span>
          </div>
        </div>
      )}

      {/* Load more trigger */}
      {!isLoading && visibleVendors.length < vendors.length && (
        <div ref={observerRef} className="mt-8 text-center">
          <button
            onClick={loadMoreVendors}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors min-h-[48px] touch-manipulation"
          >
            Load More Providers ({vendors.length - visibleVendors.length} remaining)
          </button>
        </div>
      )}

      {/* End of results */}
      {visibleVendors.length >= vendors.length && vendors.length > itemsPerPage && (
        <div className="mt-8 text-center text-gray-500">
          <p>You've seen all {vendors.length} providers in this area</p>
        </div>
      )}
    </div>
  );
}