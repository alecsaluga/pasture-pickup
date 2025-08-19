import { NextResponse } from 'next/server';
import { getVendors } from '@/lib/airtable';

export async function GET() {
  try {
    // Get all vendors regardless of status for admin
    const vendors = await getVendors({});
    
    return NextResponse.json(vendors, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Error in admin vendors API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendors' },
      { status: 500 }
    );
  }
}