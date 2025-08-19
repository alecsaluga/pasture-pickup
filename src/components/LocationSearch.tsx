'use client';

import { useRef, useEffect, useState } from 'react';
import { Location } from '@/types/vendor';

declare global {
  interface Window {
    google: any;
    initMap: () => void;
    googleMapsLoading?: boolean;
    googleMapsLoadedCallbacks?: (() => void)[];
  }
}

interface LocationSearchProps {
  onLocationSelect: (location: Location) => void;
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
}

export function LocationSearch({ onLocationSelect, placeholder = "Enter your city and state...", className = "", showSuggestions = false }: LocationSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showQuickSuggestions, setShowQuickSuggestions] = useState(false);
  
  const popularCities = [
    { name: 'Austin, TX', lat: 30.2672, lng: -97.7431 },
    { name: 'Denver, CO', lat: 39.7392, lng: -104.9903 },
    { name: 'Nashville, TN', lat: 36.1627, lng: -86.7816 },
    { name: 'Phoenix, AZ', lat: 33.4484, lng: -112.0740 },
    { name: 'Oklahoma City, OK', lat: 35.4676, lng: -97.5164 },
    { name: 'Kansas City, MO', lat: 39.0997, lng: -94.5786 }
  ];

  useEffect(() => {
    // Load Google Places API with singleton pattern
    const loadGoogleMaps = () => {
      if (window.google) {
        console.log('✅ Google Places API already loaded');
        setIsLoaded(true);
        return;
      }

      if (window.googleMapsLoading) {
        // API is currently loading, add callback
        if (!window.googleMapsLoadedCallbacks) {
          window.googleMapsLoadedCallbacks = [];
        }
        window.googleMapsLoadedCallbacks.push(() => setIsLoaded(true));
        return;
      }

      // Check if script already exists
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        console.log('✅ Google Maps script already exists');
        setIsLoaded(true);
        return;
      }

      console.log('🗺️ Loading Google Places API...');
      window.googleMapsLoading = true;
      
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('✅ Google Places API loaded successfully');
        window.googleMapsLoading = false;
        setIsLoaded(true);
        
        // Execute all waiting callbacks
        if (window.googleMapsLoadedCallbacks) {
          window.googleMapsLoadedCallbacks.forEach(callback => callback());
          window.googleMapsLoadedCallbacks = [];
        }
      };
      script.onerror = (error) => {
        console.error('❌ Failed to load Google Places API:', error);
        window.googleMapsLoading = false;
      };
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  useEffect(() => {
    if (isLoaded && inputRef.current && window.google) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ['(cities)'],
          componentRestrictions: { country: 'us' },
          fields: ['geometry', 'formatted_address', 'name', 'address_components']
        }
      );

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        
        if (place.geometry && place.geometry.location) {
          // Extract city and state from address components
          let city = '';
          let state = '';
          
          if (place.address_components) {
            place.address_components.forEach((component: any) => {
              if (component.types.includes('locality')) {
                city = component.long_name;
              } else if (component.types.includes('administrative_area_level_1')) {
                state = component.long_name;
              }
            });
          }

          const location: Location = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            address: place.formatted_address || place.name,
            name: city ? `${city}, ${state}` : place.name
          };

          setInputValue(location.name);
          setShowQuickSuggestions(false);
          onLocationSelect(location);

          // Track location search
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'location_search', {
              event_category: 'Search',
              event_label: location.name,
              custom_map: {
                location_type: 'google_places'
              }
            });
          }
        }
      });
    }
  }, [isLoaded, onLocationSelect]);

  const handleQuickSelect = (city: typeof popularCities[0]) => {
    const location: Location = {
      lat: city.lat,
      lng: city.lng,
      address: city.name,
      name: city.name
    };
    
    setInputValue(city.name);
    setShowQuickSuggestions(false);
    onLocationSelect(location);
    
    if (inputRef.current) {
      inputRef.current.value = city.name;
    }
    
    // Track quick selection
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'location_search', {
        event_category: 'Search',
        event_label: city.name,
        custom_map: {
          location_type: 'quick_select'
        }
      });
    }
  };

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
        onFocus={() => showSuggestions && setShowQuickSuggestions(true)}
        onBlur={() => setTimeout(() => setShowQuickSuggestions(false), 200)}
        onChange={(e) => setInputValue(e.target.value)}
      />
      
      {/* Quick Suggestions Dropdown */}
      {showSuggestions && showQuickSuggestions && inputValue.length === 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-50 max-h-64 overflow-y-auto">
          <div className="p-3 border-b border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">📍 Popular Farm Areas</h4>
          </div>
          {popularCities.map((city, index) => (
            <button
              key={index}
              onClick={() => handleQuickSelect(city)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 flex items-center space-x-3 touch-manipulation"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-[#0a3b3d] to-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">{city.name.split(',')[1]?.trim() || city.name.charAt(0)}</span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">{city.name}</div>
                <div className="text-xs text-gray-500">High demand area</div>
              </div>
            </button>
          ))}
          <div className="p-3 bg-gray-50 text-center">
            <p className="text-xs text-gray-600">Or type your city/address above for more options</p>
          </div>
        </div>
      )}
    </div>
  );
}