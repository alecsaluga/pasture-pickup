import { Client } from '@googlemaps/google-maps-services-js';

const client = new Client({});

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  city: string;
  state: string;
  stateCode: string;
  country: string;
}

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  try {
    const response = await client.geocode({
      params: {
        address: address,
        key: process.env.GOOGLE_MAPS_API_KEY!,
        components: { country: 'US' }
      }
    });

    if (response.data.results.length === 0) {
      return null;
    }

    const result = response.data.results[0];
    const location = result.geometry.location;
    
    // Extract address components
    let city = '';
    let state = '';
    let stateCode = '';
    let country = '';

    result.address_components.forEach(component => {
      if (component.types.includes('locality')) {
        city = component.long_name;
      } else if (component.types.includes('administrative_area_level_1')) {
        state = component.long_name;
        stateCode = component.short_name;
      } else if (component.types.includes('country')) {
        country = component.long_name;
      }
    });

    return {
      latitude: location.lat,
      longitude: location.lng,
      formattedAddress: result.formatted_address,
      city,
      state,
      stateCode,
      country
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null> {
  try {
    const response = await client.reverseGeocode({
      params: {
        latlng: { lat, lng },
        key: process.env.GOOGLE_MAPS_API_KEY!
      }
    });

    if (response.data.results.length === 0) {
      return null;
    }

    const result = response.data.results[0];
    
    // Extract address components
    let city = '';
    let state = '';
    let stateCode = '';
    let country = '';

    result.address_components.forEach(component => {
      if (component.types.includes('locality')) {
        city = component.long_name;
      } else if (component.types.includes('administrative_area_level_1')) {
        state = component.long_name;
        stateCode = component.short_name;
      } else if (component.types.includes('country')) {
        country = component.long_name;
      }
    });

    return {
      latitude: lat,
      longitude: lng,
      formattedAddress: result.formatted_address,
      city,
      state,
      stateCode,
      country
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}