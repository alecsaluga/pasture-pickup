'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Vendor, Location } from '@/types/vendor';
import { LocationSearch } from './LocationSearch';
import { MapPin, Phone, Star, Navigation, Clock } from 'lucide-react';

import 'mapbox-gl/dist/mapbox-gl.css';

interface VendorMapProps {
  vendors: Vendor[];
  onVendorSelect?: (vendor: Vendor) => void;
  onLocationSearch?: (location: Location | null) => void;
  height?: string;
  showSearch?: boolean;
  defaultView?: 'us' | 'local';
  centerLocation?: Location;
}

export function VendorMap({ 
  vendors, 
  onVendorSelect, 
  onLocationSearch, 
  height = 'h-96',
  showSearch = true,
  defaultView = 'local',
  centerLocation
}: VendorMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [userLocation, setUserLocation] = useState<Location | null>(null);

  // Custom marker element creation
  const createCustomMarker = (vendor: Vendor, isEmergency: boolean) => {
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.style.cssText = `
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: ${isEmergency ? 'linear-gradient(135deg, #EF4444, #DC2626)' : 'linear-gradient(135deg, #0a3b3d, #083234)'};
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease;
      position: relative;
    `;
    
    // Add truck icon
    const icon = document.createElement('div');
    icon.innerHTML = '🚛';
    icon.style.cssText = `
      font-size: 16px;
      line-height: 1;
    `;
    el.appendChild(icon);

    // Add emergency badge if needed
    if (isEmergency) {
      const badge = document.createElement('div');
      badge.style.cssText = `
        position: absolute;
        top: -4px;
        right: -4px;
        width: 16px;
        height: 16px;
        background: #DC2626;
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 8px;
      `;
      badge.innerHTML = '⚡';
      el.appendChild(badge);
    }

    // Hover effects with stable positioning
    el.addEventListener('mouseenter', () => {
      el.style.transform = 'scale(1.1)';
      el.style.zIndex = '1000';
      el.style.transition = 'transform 0.2s ease, z-index 0s';
    });
    
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'scale(1)';
      el.style.zIndex = '1';
      el.style.transition = 'transform 0.2s ease, z-index 0.2s';
    });

    return el;
  };

  // Enhanced popup content
  const createPopupContent = (vendor: Vendor) => {
    return `
      <div class="vendor-popup" style="max-width: 280px; font-family: system-ui, -apple-system, sans-serif;">
        <div style="padding: 16px;">
          <!-- Header -->
          <div style="display: flex; justify-between; align-items: start; margin-bottom: 12px;">
            <h3 style="font-size: 18px; font-weight: 700; color: #111827; margin: 0; line-height: 1.2;">
              ${vendor.name}
            </h3>
          </div>
          
          <!-- Location & Rating -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; color: #6B7280; font-size: 14px;">
              📍 ${vendor.city}, ${vendor.stateCode}
            </div>
            <div style="display: flex; align-items: center; color: #F59E0B; font-size: 12px;">
              ⭐ 4.8 (24 reviews)
            </div>
          </div>
          
          <!-- Description -->
          <p style="color: #6B7280; font-size: 14px; margin: 8px 0; line-height: 1.4;">
            ${vendor.description.length > 80 ? vendor.description.substring(0, 80) + '...' : vendor.description}
          </p>
          
          <!-- Services -->
          <div style="margin: 12px 0;">
            <div style="display: flex; flex-wrap: wrap; gap: 4px;">
              ${vendor.serviceTypes.slice(0, 2).map(service => 
                `<span style="background: #f0fdfd; color: #0a3b3d; font-size: 10px; padding: 4px 8px; border-radius: 8px; font-weight: 500;">
                  ${service.replace(' Removal', '')}
                </span>`
              ).join('')}
              ${vendor.serviceTypes.length > 2 ? 
                `<span style="background: #F3F4F6; color: #6B7280; font-size: 10px; padding: 4px 8px; border-radius: 8px;">
                  +${vendor.serviceTypes.length - 2} more
                </span>` 
                : ''
              }
            </div>
          </div>
          
          <!-- Business Hours -->
          ${vendor.businessHours ? 
            `<div style="margin: 8px 0; font-size: 12px; color: #6B7280;">
              🕒 ${vendor.businessHours}
            </div>` 
            : ''
          }
          
          <!-- Action Buttons -->
          <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 16px;">
            <a href="tel:${vendor.phone}" 
               style="background: #0a3b3d; color: white; padding: 12px 16px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; text-align: center; display: flex; align-items: center; justify-content: center; gap: 6px;">
              📞 Call Now: ${vendor.phone}
            </a>
            <a href="/vendor/${vendor.id}" 
               style="background: #6B7280; color: white; padding: 10px 16px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 14px; text-align: center; display: flex; align-items: center; justify-content: center; gap: 6px;">
              👁️ View Details
            </a>
          </div>
        </div>
      </div>
    `;
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

    const initialCenter = defaultView === 'us' 
      ? [-98.5795, 39.8283] // Center of USA
      : centerLocation 
        ? [centerLocation.lng, centerLocation.lat]
        : [-98.5795, 39.8283];
    
    const initialZoom = defaultView === 'us' ? 4 : centerLocation ? 11 : 4;

    map.current = new mapboxgl.Map({
      container: mapRef.current,
      style: 'mapbox://styles/mapbox/light-v11', // Cleaner light style
      center: initialCenter,
      zoom: initialZoom,
      attributionControl: false
    });

    // Add navigation controls with custom styling
    const nav = new mapboxgl.NavigationControl({
      showCompass: false,
      showZoom: true,
      visualizePitch: false
    });
    map.current.addControl(nav, 'bottom-right');

    // Add geolocate control
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: false
    });
    map.current.addControl(geolocate, 'bottom-right');

    // Mobile optimizations
    map.current.dragRotate.disable();
    map.current.touchZoomRotate.disableRotation();

    // Setup clustering for US view - but don't add layers yet
    if (defaultView === 'us') {
      const setupClustering = () => {
        if (!map.current || !map.current.isStyleLoaded()) {
          console.log('⚠️ Map not ready for clustering setup');
          return;
        }
        
        console.log('🔧 Setting up map clustering...');
        
        // Remove existing source and layers if they exist
        try {
          if (map.current.getLayer('unclustered-point')) map.current.removeLayer('unclustered-point');
          if (map.current.getLayer('cluster-count')) map.current.removeLayer('cluster-count'); 
          if (map.current.getLayer('clusters')) map.current.removeLayer('clusters');
          if (map.current.getSource('vendors')) map.current.removeSource('vendors');
        } catch (e) {
          console.log('🧹 No existing layers to clean up');
        }
        
        // Add clustering source with empty initial data
        map.current.addSource('vendors', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          },
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50
        });
        
        console.log('✅ Vendors source created successfully');

        // Add cluster circles - simplified blue theme
        map.current.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'vendors',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': '#3b82f6',
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              20,
              10,
              30,
              30,
              40
            ],
            'circle-stroke-width': 3,
            'circle-stroke-color': '#ffffff'
          }
        });

        // Add cluster count
        map.current.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'vendors',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 14,
            'text-allow-overlap': true
          },
          paint: {
            'text-color': '#ffffff'
          }
        });

        // Add unclustered points - consistent blue
        map.current.addLayer({
          id: 'unclustered-point',
          type: 'circle',
          source: 'vendors',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': '#3b82f6',
            'circle-radius': 12,
            'circle-stroke-width': 3,
            'circle-stroke-color': '#ffffff'
          }
        });

        // Click events for clusters
        map.current.on('click', 'clusters', (e) => {
          if (!map.current) return;
          
          const features = map.current.queryRenderedFeatures(e.point, {
            layers: ['clusters']
          });
          
          const clusterId = features[0].properties.cluster_id;
          const source = map.current.getSource('vendors') as mapboxgl.GeoJSONSource;
          
          source.getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err || !map.current) return;
            
            map.current.easeTo({
              center: (features[0].geometry as any).coordinates,
              zoom: zoom
            });
          });
        });

        // Click events for individual points
        map.current.on('click', 'unclustered-point', (e) => {
          if (!map.current) return;
          
          const coordinates = (e.features![0].geometry as any).coordinates.slice();
          const vendor = e.features![0].properties;
          
          try {
            const vendorData = JSON.parse(vendor.vendorData);
            new mapboxgl.Popup({
              offset: 15,
              closeButton: true,
              closeOnClick: false,
              maxWidth: '280px',
              anchor: 'bottom',
              className: 'vendor-popup-container'
            })
              .setLngLat(coordinates)
              .setHTML(createPopupContent(vendorData))
              .addTo(map.current);
              
            if (onVendorSelect) {
              onVendorSelect(vendorData);
            }
          } catch (error) {
            console.error('Error parsing vendor data:', error);
          }
        });

        // Change cursor on hover
        map.current.on('mouseenter', 'clusters', () => {
          if (map.current) map.current.getCanvas().style.cursor = 'pointer';
        });
        map.current.on('mouseleave', 'clusters', () => {
          if (map.current) map.current.getCanvas().style.cursor = '';
        });
        map.current.on('mouseenter', 'unclustered-point', () => {
          if (map.current) map.current.getCanvas().style.cursor = 'pointer';
        });
        map.current.on('mouseleave', 'unclustered-point', () => {
          if (map.current) map.current.getCanvas().style.cursor = '';
        });
      };
      
      if (map.current.isStyleLoaded()) {
        setupClustering();
      } else {
        map.current.on('load', setupClustering);
      }
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [defaultView]);

  // Update markers when vendors change
  useEffect(() => {
    console.log(`🗺️ VendorMap: useEffect triggered with ${vendors.length} vendors, defaultView: ${defaultView}`);
    
    // Add delay to ensure map is fully ready
    const timeoutId = setTimeout(() => {
      if (!map.current || !map.current.isStyleLoaded()) {
        console.log('⚠️ VendorMap: Map not ready, skipping');
        return;
      }

      if (defaultView === 'us') {
        console.log('🌍 VendorMap: Using US view with clustering');
        
        // Ensure we have valid vendors
        const validVendors = vendors.filter(vendor => vendor.latitude && vendor.longitude);
        console.log(`🔍 Valid vendors with coordinates: ${validVendors.length}`);
        
        if (validVendors.length === 0) {
          console.log('⏳ No valid vendors to display');
          return;
        }
        
        // Create GeoJSON data
        const geojsonData = {
          type: 'FeatureCollection' as const,
          features: validVendors.map(vendor => {
            console.log(`📍 Adding vendor: ${vendor.name} at [${vendor.longitude}, ${vendor.latitude}]`);
            return {
              type: 'Feature' as const,
              geometry: {
                type: 'Point' as const,
                coordinates: [vendor.longitude, vendor.latitude]
              },
              properties: {
                id: vendor.id,
                name: vendor.name,
                city: vendor.city,
                state: vendor.stateCode,
                vendorData: JSON.stringify(vendor)
              }
            };
          })
        };
        
        console.log('🎯 GeoJSON features:', geojsonData.features.length);
        
        // Get the source that was created during map initialization
        const source = map.current.getSource('vendors') as mapboxgl.GeoJSONSource;
        if (source) {
          console.log('🔄 Updating existing source with vendor data');
          source.setData(geojsonData);
        } else {
          console.log('❌ Vendors source not found');
          return;
        }
        
        // Force the map to show the vendor locations with more zoom out
        if (validVendors.length > 0) {
          const bounds = new mapboxgl.LngLatBounds();
          validVendors.forEach(vendor => {
            bounds.extend([vendor.longitude, vendor.latitude]);
          });
          
          // Fit the map to show all vendors with more padding
          setTimeout(() => {
            if (map.current) {
              map.current.fitBounds(bounds, {
                padding: 200,
                maxZoom: 4  // Much more zoomed out
              });
              console.log('🎯 Map fitted to vendor bounds');
            }
          }, 1000);
        }
      } else {
        // Use individual markers for local view
      
        // Clear existing markers
        markers.current.forEach(marker => marker.remove());
        markers.current = [];

        // Add vendor markers with custom styling
        vendors.forEach(vendor => {
          if (!vendor.latitude || !vendor.longitude) return;

          const isEmergency = vendor.emergencyService;
          const markerElement = createCustomMarker(vendor, isEmergency);
          
          const popup = new mapboxgl.Popup({ 
            offset: 15,
            closeButton: true,
            closeOnClick: false,
            maxWidth: '280px',
            anchor: 'bottom',
            className: 'vendor-popup-container'
          }).setHTML(createPopupContent(vendor));

          const marker = new mapboxgl.Marker({ 
            element: markerElement
          })
            .setLngLat([vendor.longitude, vendor.latitude])
            .setPopup(popup)
            .addTo(map.current!);

          // Enhanced click handling
          markerElement.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Close other popups
            markers.current.forEach(m => {
              if (m !== marker && m.getPopup().isOpen()) {
                m.getPopup().remove();
              }
            });
            
            // Track analytics
            if (typeof window !== 'undefined' && window.gtag) {
              window.gtag('event', 'map_marker_click', {
                vendor_name: vendor.name,
                location: `${vendor.city}, ${vendor.stateCode}`
              });
            }
            
            if (onVendorSelect) {
              onVendorSelect(vendor);
            }
          });

          markers.current.push(marker);
        });

        // Smart map fitting - only for local view
        if (vendors.length > 0 && vendors.some(v => v.latitude && v.longitude)) {
          const validVendors = vendors.filter(v => v.latitude && v.longitude);
          
          if (centerLocation) {
            // For search results, center on the searched location - more zoomed out
            map.current.flyTo({
              center: [centerLocation.lng, centerLocation.lat],
              zoom: 6,
              duration: 1000
            });
          } else {
            // For other local views, fit to vendor bounds
            const bounds = new mapboxgl.LngLatBounds();
            validVendors.forEach(vendor => {
              bounds.extend([vendor.longitude, vendor.latitude]);
            });
            
            const padding = window.innerWidth < 768 ? 30 : 50;
            map.current.fitBounds(bounds, { 
              padding,
              maxZoom: vendors.length === 1 ? 9 : 7
            });
          }
        }
      }
    }, 500); // Add delay
    
    // Cleanup timeout
    return () => clearTimeout(timeoutId);
  }, [vendors, onVendorSelect, defaultView, centerLocation]);

  // Add a debug useEffect to see when vendors change
  useEffect(() => {
    console.log('🐛 DEBUG: Vendors changed:', vendors.length, vendors.map(v => `${v.name} (${v.latitude}, ${v.longitude})`));
  }, [vendors]);
  
  // Add debugging for map state
  useEffect(() => {
    console.log('🐛 DEBUG: Map state -', {
      hasMap: !!map.current,
      isStyleLoaded: map.current?.isStyleLoaded(),
      vendorCount: vendors.length,
      defaultView
    });
  }, [vendors, defaultView]);

  const handleLocationSelect = (location: Location) => {
    setUserLocation(location);
    
    if (map.current) {
      // Smooth fly-to animation
      map.current.flyTo({
        center: [location.lng, location.lat],
        zoom: 11,
        duration: 2000,
        essential: true
      });
      
      // Create custom user location marker
      const userMarkerEl = document.createElement('div');
      userMarkerEl.style.cssText = `
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: linear-gradient(135deg, #3B82F6, #1D4ED8);
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        position: relative;
        animation: pulse 2s infinite;
      `;
      
      // Add pulse animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
      `;
      document.head.appendChild(style);
      
      const userMarker = new mapboxgl.Marker({ 
        element: userMarkerEl
      })
        .setLngLat([location.lng, location.lat])
        .setPopup(new mapboxgl.Popup({ offset: 15 }).setHTML(`
          <div style="padding: 12px; text-align: center;">
            <h3 style="font-weight: 600; margin: 0 0 8px 0; color: #111827;">📍 Your Location</h3>
            <p style="margin: 0; color: #6B7280; font-size: 14px;">${location.address}</p>
          </div>
        `))
        .addTo(map.current);
      
      markers.current.push(userMarker);
    }
    
    if (onLocationSearch) {
      onLocationSearch(location);
    }
  };

  const handleClearLocation = () => {
    setUserLocation(null);
    
    if (onLocationSearch) {
      onLocationSearch(null);
    }
    
    // Remove user location marker
    markers.current = markers.current.filter(marker => {
      const element = marker.getElement();
      if (element.style.background?.includes('59, 130, 246')) {
        marker.remove();
        return false;
      }
      return true;
    });
    
    // Reset to show all vendors
    if (vendors.length > 0 && map.current) {
      const validVendors = vendors.filter(v => v.latitude && v.longitude);
      if (validVendors.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        validVendors.forEach(vendor => {
          bounds.extend([vendor.longitude, vendor.latitude]);
        });
        const padding = window.innerWidth < 768 ? 30 : 50;
        map.current.fitBounds(bounds, { padding, maxZoom: 10 });
      }
    }
  };

  return (
    <div className="relative">
      {showSearch && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="bg-white rounded-xl shadow-lg p-2">
            <LocationSearch 
              onLocationSelect={handleLocationSelect}
              placeholder="Search for your location..."
              className="w-full border-0 focus:ring-2 focus:ring-[#0a3b3d] rounded-lg text-gray-900"
            />
          </div>
          
          {userLocation && (
            <div className="mt-2 bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900 flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                    Showing vendors near:
                  </p>
                  <p className="text-sm text-gray-600 ml-6">{userLocation.name}</p>
                </div>
                <button 
                  onClick={handleClearLocation}
                  className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div ref={mapRef} className={`w-full ${height} rounded-xl overflow-hidden`} />
      
      {vendors.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/90 backdrop-blur-sm rounded-xl">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">No vendors found in this area</p>
            <p className="text-sm text-gray-500 mt-1">Try expanding your search radius</p>
          </div>
        </div>
      )}
      
    </div>
  );
}