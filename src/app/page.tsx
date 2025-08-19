'use client';

import { useState, useEffect } from 'react';
import { VendorMap } from '@/components/VendorMap';
import { LocationSearch } from '@/components/LocationSearch';
import { Vendor, Location } from '@/types/vendor';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Shield, 
  Search, 
  Heart,
  Star,
  Navigation,
  Globe,
  ArrowRight,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { LazyVendorGrid } from '@/components/LazyVendorGrid';

export default function Home() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchVendors = async () => {
    try {
      console.log('🏠 Homepage: Fetching vendors...');
      const response = await fetch('/api/vendors');
      const data = await response.json();
      console.log(`🏠 Homepage: Received ${data.length} vendors:`, data);
      setVendors(data);
      setFilteredVendors(data);
      console.log('🏠 Homepage: Vendors state updated');
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSearch = (location: Location | null) => {
    if (location) {
      // Navigate to search results page with location
      const locationParam = encodeURIComponent(location.name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-'));
      window.location.href = `/search/${locationParam}?lat=${location.lat}&lng=${location.lng}&address=${encodeURIComponent(location.address)}`;
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 3959;
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#0a3b3d] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Finding livestock removal services...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen relative"
      style={{ 
        background: `
          linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%),
          repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(108,117,125,0.08) 8px, rgba(108,117,125,0.08) 9px),
          repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(108,117,125,0.08) 8px, rgba(108,117,125,0.08) 9px),
          repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(108,117,125,0.05) 20px, rgba(108,117,125,0.05) 22px),
          repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(108,117,125,0.05) 20px, rgba(108,117,125,0.05) 22px),
          radial-gradient(circle at 25% 25%, rgba(108,117,125,0.03) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, rgba(108,117,125,0.03) 0%, transparent 50%)
        `
      }}
    >
      {/* Modern Header */}
      <header className={`sticky top-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-lg' 
          : ''
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
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
            <nav className="hidden md:flex space-x-6">
              <Link href="/about" className={`transition-colors min-h-[44px] flex items-center touch-manipulation ${
                isScrolled 
                  ? 'text-gray-600 hover:text-[#0a3b3d] active:text-[#083234]' 
                  : 'text-gray-700 hover:text-gray-900 active:text-gray-800'
              }`}>
                About
              </Link>
            </nav>
            {/* Mobile menu button */}
            <button className={`md:hidden p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation ${
              isScrolled 
                ? 'hover:bg-gray-100 active:bg-gray-200' 
                : 'hover:bg-white/10 active:bg-white/20'
            }`}>
              <svg className={`w-6 h-6 transition-colors ${isScrolled ? 'text-gray-600' : 'text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Modern Hero Section */}
      <section className="relative overflow-hidden min-h-[70vh] flex items-center bg-white">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 w-full">
          <div className="text-center max-w-4xl mx-auto animate-fadeInUp">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gray-800/10 text-gray-800 backdrop-blur-sm border border-gray-300/50 mb-4">
                🌾 Trusted by 2,500+ Farms Nationwide
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-4 leading-tight text-gray-900">
              Find livestock pickup
              <br />
              <span className="text-gray-700">services near you</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-700 mb-8 leading-relaxed max-w-3xl mx-auto">
              Connect with <span className="font-semibold text-gray-900">licensed professionals</span> for safe, respectful livestock removal.
              <br className="hidden sm:block" />
              <span className="text-gray-800">Available nationwide</span> across the United States.
            </p>

            {/* Modern Search Bar */}
            <div className="glass backdrop-blur-xl rounded-3xl p-4 sm:p-3 shadow-2xl max-w-2xl mx-auto mb-8 border border-gray-200/50 bg-white/80 animate-scaleIn">
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
                <div className="flex-1 relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#0a3b3d] transition-colors" />
                  <LocationSearch
                    onLocationSelect={handleLocationSearch}
                    placeholder="Enter your city and state..."
                    className="w-full pl-12 pr-4 py-4 text-gray-900 text-base sm:text-lg border-0 rounded-2xl focus:ring-2 bg-white/90 backdrop-blur-sm min-h-[56px] touch-manipulation transition-all duration-200 hover:bg-white focus:bg-white"
                    style={{ '--tw-ring-color': '#0a3b3d' } as React.CSSProperties}
                  />
                </div>
                <button 
                  className="px-6 sm:px-8 py-4 text-base sm:text-lg min-h-[56px] touch-manipulation font-bold tracking-wide rounded-2xl text-white transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-xl"
                  style={{ backgroundColor: '#0a3b3d' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#083234'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0a3b3d'}
                >
                  🔍 Find Services
                </button>
              </div>
              <div className="mt-3 text-center">
                <p className="text-xs text-gray-600">
                  ✨ <span className="font-medium text-gray-800">500+ verified providers</span> ready to help
                </p>
              </div>
            </div>

            {/* Service Icons */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-6 lg:gap-8 text-gray-600">
              <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 text-center sm:text-left">
                <div className="w-12 h-12 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gray-200/50 rounded-full flex items-center justify-center touch-manipulation">
                  🐎
                </div>
                <span className="font-medium text-sm sm:text-base">Horses</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 text-center sm:text-left">
                <div className="w-12 h-12 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gray-200/50 rounded-full flex items-center justify-center touch-manipulation">
                  🐄
                </div>
                <span className="font-medium text-sm sm:text-base">Cattle</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 text-center sm:text-left">
                <div className="w-12 h-12 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gray-200/50 rounded-full flex items-center justify-center touch-manipulation">
                  🐐
                </div>
                <span className="font-medium text-sm sm:text-base">Goats</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 text-center sm:text-left">
                <div className="w-12 h-12 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gray-200/50 rounded-full flex items-center justify-center touch-manipulation">
                  🦙
                </div>
                <span className="font-medium text-sm sm:text-base">Llamas</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 text-center sm:text-left">
                <div className="w-12 h-12 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gray-200/50 rounded-full flex items-center justify-center touch-manipulation">
                  <span className="text-xl text-gray-600">+</span>
                </div>
                <span className="font-medium text-sm sm:text-base">And More</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Trust Signals */}
      <section className="bg-gradient-to-r from-gray-50 to-white py-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Trusted by Farmers & Ranchers Nationwide</h2>
            <p className="text-gray-600">Professional, reliable, and available when you need us most</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">24/7 Emergency</h3>
              <p className="text-sm text-gray-600 mb-3">Immediate response when you need it most</p>
              <div className="text-xs text-red-600 font-semibold bg-red-50 py-1 px-3 rounded-full inline-block">
                ALWAYS AVAILABLE
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 text-center group">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, #0a3b3d, #083234)' }}>
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Licensed & Insured</h3>
              <p className="text-sm text-gray-600 mb-3">All providers verified and certified</p>
              <div className="text-xs font-semibold py-1 px-3 rounded-full inline-block" style={{ color: '#0a3b3d', backgroundColor: '#f0fdfd' }}>
                FULLY VERIFIED
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Nationwide Coverage</h3>
              <p className="text-sm text-gray-600 mb-3">Service providers in all 50 states</p>
              <div className="text-xs text-blue-600 font-semibold bg-blue-50 py-1 px-3 rounded-full inline-block">
                ALL 50 STATES
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Trusted Service</h3>
              <p className="text-sm text-gray-600 mb-3">Thousands of satisfied customers</p>
              <div className="text-xs text-purple-600 font-semibold bg-purple-50 py-1 px-3 rounded-full inline-block">
                4.9/5 RATING
              </div>
            </div>
          </div>
          
          {/* Social Proof */}
          <div className="mt-12 text-center">
            <div className="flex justify-center items-center space-x-8 opacity-60">
              <div className="text-sm text-gray-500">🌾 <span className="font-semibold">2,500+</span> Farm Partners</div>
              <div className="text-sm text-gray-500">🚚 <span className="font-semibold">500+</span> Service Providers</div>
              <div className="text-sm text-gray-500">⭐ <span className="font-semibold">10,000+</span> Happy Customers</div>
            </div>
          </div>
        </div>
      </section>

      <main className="bg-gray-50">
        {/* Full US Map Section */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b bg-gradient-to-r from-slate-50 to-blue-50">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Livestock Removal Providers Nationwide
                </h2>
                <p className="text-gray-600">
                  {vendors.length} professional providers across the United States
                </p>
              </div>
              <VendorMap
                vendors={vendors}
                onLocationSearch={handleLocationSearch}
                height="h-[500px]"
                showSearch={false}
                defaultView="us"
                key={`map-${vendors.length}`}
              />
            </div>
          </div>
        </section>

        {/* Featured Providers Preview */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Providers</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our network of trusted professionals is ready to help. Search above to find providers in your area.
              </p>
            </div>
            
            <LazyVendorGrid
              vendors={vendors.slice(0, 4)}
              selectedLocation={null}
              itemsPerPage={4}
            />
            
            {vendors.length > 4 && (
              <div className="text-center mt-8">
                <p className="text-gray-600 mb-4">
                  Showing 4 of {vendors.length} providers. Use the map above to find services in your area.
                </p>
              </div>
            )}
          </div>
        </section>


        {/* How It Works */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
              <p className="text-xl text-gray-600">Get professional livestock removal in three simple steps</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, #0a3b3d, #083234)' }}>
                  <Search className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">1. Search</h3>
                <p className="text-gray-600">Enter your location to find licensed livestock removal professionals in your area.</p>
              </div>
              
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Phone className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">2. Contact</h3>
                <p className="text-gray-600">Call directly for immediate assistance or get directions to their location.</p>
              </div>
              
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">3. Service</h3>
                <p className="text-gray-600">Professional, respectful removal service with proper licensing and insurance.</p>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}