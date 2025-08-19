import { NextRequest, NextResponse } from 'next/server';
import { submitVendor } from '@/lib/airtable';
import { geocodeAddress } from '@/lib/geocoding';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get client IP for tracking
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    
    // Validate required fields
    const requiredFields = ['businessName', 'contactName', 'phone', 'email', 'address', 'description', 'services'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Geocode the address if coordinates not provided
    let latitude = body.latitude;
    let longitude = body.longitude;
    
    if (!latitude || !longitude) {
      const geocodeResult = await geocodeAddress(body.address);
      if (!geocodeResult) {
        return NextResponse.json(
          { error: 'Unable to geocode the provided address' },
          { status: 400 }
        );
      }
      latitude = geocodeResult.latitude;
      longitude = geocodeResult.longitude;
    }
    
    // Prepare submission data
    const submissionData = {
      businessName: body.businessName,
      contactName: body.contactName,
      phone: body.phone,
      email: body.email,
      address: body.address,
      website: body.website || '',
      description: body.description,
      services: Array.isArray(body.services) ? body.services : [],
      species: Array.isArray(body.species) ? body.species : [],
      serviceRadius: parseInt(body.serviceRadius) || 25,
      emergencyService: Boolean(body.emergencyService),
      businessHours: body.businessHours || '',
      submitterIP: ip,
      latitude,
      longitude
    };
    
    // Submit to Airtable
    const submissionId = await submitVendor(submissionData);
    
    if (!submissionId) {
      return NextResponse.json(
        { error: 'Failed to submit vendor to database' },
        { status: 500 }
      );
    }
    
    // TODO: Send email notification to admins
    // TODO: Send confirmation email to submitter
    
    return NextResponse.json(
      { 
        message: 'Vendor submitted successfully',
        submissionId 
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error in submit-vendor API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}