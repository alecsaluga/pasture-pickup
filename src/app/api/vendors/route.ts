import { NextRequest, NextResponse } from 'next/server';
import { getVendors } from '@/lib/airtable';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get('refresh') === 'true';
    
    console.log('🔍 Vendors API called with params:', Object.fromEntries(searchParams.entries()));
    
    const filters: any = {
      status: 'Active'
    };
    
    // Add service type filters
    const serviceTypes = searchParams.get('serviceTypes');
    if (serviceTypes) {
      filters.serviceTypes = serviceTypes.split(',');
    }
    
    // Add location filters
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius');
    
    if (lat && lng) {
      filters.location = {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        radius: radius ? parseInt(radius) : 50
      };
    }
    
    console.log('📋 Fetching vendors with filters:', filters);
    const vendors = await getVendors(filters);
    console.log(`✅ Found ${vendors.length} vendors`);
    
    // Log first vendor for debugging
    if (vendors.length > 0) {
      console.log('🏢 Sample vendor:', {
        id: vendors[0].id,
        name: vendors[0].name,
        city: vendors[0].city,
        state: vendors[0].state,
        latitude: vendors[0].latitude,
        longitude: vendors[0].longitude,
        status: vendors[0].status
      });
    }
    
    // Reduce cache time for real-time updates, disable cache if refresh requested
    const cacheHeaders = refresh 
      ? { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      : { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' };
    
    return NextResponse.json(vendors, {
      headers: {
        ...cacheHeaders,
        'X-Vendor-Count': vendors.length.toString(),
        'X-Timestamp': new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Error in vendors API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendors', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}