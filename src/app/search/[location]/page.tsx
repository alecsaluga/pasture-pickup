import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getVendors } from '@/lib/airtable';
import { VendorMap } from '@/components/VendorMap';
import { LazyVendorGrid } from '@/components/LazyVendorGrid';
import { Vendor, Location } from '@/types/vendor';
import { MapPin, Phone, Clock, Users, ArrowLeft, Filter, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface SearchPageProps {
  params: {
    location: string;
  };
  searchParams: {
    lat?: string;
    lng?: string;
    address?: string;
  };
}

export async function generateMetadata({ params, searchParams }: SearchPageProps): Promise<Metadata> {
  const { location } = await params;
  const locationName = decodeURIComponent(location).replace(/-/g, ' ');
  
  return {
    title: `Livestock Removal Services in ${locationName} | Pasture Pickup`,
    description: `Find professional livestock removal services in ${locationName}. Licensed, insured providers available 24/7 for emergency livestock removal.`,
    openGraph: {
      title: `Livestock Removal Services in ${locationName}`,
      description: `Professional livestock removal services in ${locationName}. Licensed, insured providers available 24/7.`,
      type: 'website',
      locale: 'en_US',
      siteName: 'Pasture Pickup'
    },
    alternates: {
      canonical: `/search/${location}`
    }
  };
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { location } = await params;
  const awaitedSearchParams = await searchParams;
  const locationName = decodeURIComponent(location).replace(/-/g, ' ');
  const lat = awaitedSearchParams.lat ? parseFloat(awaitedSearchParams.lat) : null;
  const lng = awaitedSearchParams.lng ? parseFloat(awaitedSearchParams.lng) : null;
  const address = awaitedSearchParams.address ? decodeURIComponent(awaitedSearchParams.address) : locationName;

  if (!lat || !lng) {
    notFound();
  }

  const searchLocation: Location = {
    lat,
    lng,
    address,
    name: locationName
  };

  // Fetch all vendors
  const allVendors = await getVendors({ status: 'Active' });
  
  // Filter vendors within 50 miles of search location
  const nearbyVendors = allVendors.filter(vendor => {
    if (!vendor.latitude || !vendor.longitude) return false;
    const distance = calculateDistance(lat, lng, vendor.latitude, vendor.longitude);
    return distance <= 50; // 50 mile radius
  });

  // Sort by distance
  const sortedVendors = nearbyVendors
    .map(vendor => ({
      ...vendor,
      distance: calculateDistance(lat, lng, vendor.latitude, vendor.longitude)
    }))
    .sort((a, b) => a.distance - b.distance);

  function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 3959; // miles
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  function toRad(value: number): number {
    return value * Math.PI / 180;
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    "name": `Livestock Removal Services in ${locationName}`,
    "description": `Search results for livestock removal services in ${locationName}`,
    "url": `/search/${location}`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": sortedVendors.length,
      "itemListElement": sortedVendors.slice(0, 10).map((vendor, index) => ({
        "@type": "LocalBusiness",
        "position": index + 1,
        "name": vendor.name,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": vendor.city,
          "addressRegion": vendor.state
        }
      }))
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center min-h-[44px] touch-manipulation">
                <Image
                  src="/logo.png"
                  alt="Pasture Pickup Logo"
                  width={144}
                  height={144}
                  className="rounded-lg"
                  priority
                />
              </Link>
              
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors min-h-[44px] touch-manipulation"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Map</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Search Results Header */}
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Livestock Removal Services in {locationName}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{address}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>{sortedVendors.length} provider{sortedVendors.length !== 1 ? 's' : ''} found</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>50 mile radius</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 sm:mt-0">
                <button className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors min-h-[44px] touch-manipulation">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filters</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Map Section */}
          <section className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-4 border-b bg-gradient-to-r from-slate-50 to-blue-50">
                <h2 className="text-lg font-semibold text-gray-900">
                  Providers Near {locationName}
                </h2>
              </div>
              <VendorMap
                vendors={sortedVendors}
                height="h-[400px]"
                showSearch={false}
                defaultView="local"
                centerLocation={searchLocation}
              />
            </div>
          </section>

          {/* Results Section */}
          {sortedVendors.length > 0 ? (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Available Providers ({sortedVendors.length})
                </h2>
                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="distance">Sort by Distance</option>
                  <option value="rating">Sort by Rating</option>
                  <option value="name">Sort by Name</option>
                </select>
              </div>
              
              <LazyVendorGrid
                vendors={sortedVendors}
                selectedLocation={searchLocation}
                itemsPerPage={12}
              />
            </section>
          ) : (
            <section className="text-center py-16">
              <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MapPin className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  No Providers Found in {locationName}
                </h3>
                <p className="text-gray-600 mb-8">
                  We couldn't find any livestock removal services within 50 miles of {locationName}. 
                  Try expanding your search or contact us for assistance.
                </p>
                
                <div className="bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 border-2 border-red-200 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-red-900 mb-2">🚨 Need Emergency Help?</h4>
                  <p className="text-red-800 mb-4 text-sm">
                    Professional livestock removal available 24/7 nationwide. Fast response guaranteed.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a 
                      href="tel:+1234567890"
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-colors inline-flex items-center justify-center space-x-2 min-h-[48px] touch-manipulation"
                    >
                      <Phone className="w-5 h-5" />
                      <span>Call Emergency Line</span>
                    </a>
                    <Link
                      href="/"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center space-x-2 min-h-[48px] touch-manipulation"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      <span>Back to Map</span>
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  );
}