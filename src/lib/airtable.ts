import Airtable from 'airtable';
import { Vendor, VendorSubmission } from '@/types/vendor';

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID!);

const VENDORS_TABLE = 'Vendors';
const SUBMISSIONS_TABLE = 'Vendor Submissions';

export async function getVendors(filters: {
  status?: string;
  location?: { lat: number; lng: number; radius?: number };
  serviceTypes?: string[];
} = {}): Promise<Vendor[]> {
  try {
    console.log('🔗 Connecting to Airtable:', {
      baseId: process.env.AIRTABLE_BASE_ID?.substring(0, 10) + '...',
      hasApiKey: !!process.env.AIRTABLE_API_KEY,
      table: VENDORS_TABLE,
      filters
    });
    
    const filterFormula = [];
    
    if (filters.status) {
      filterFormula.push(`{Status} = "${filters.status}"`);
    }
    
    if (filters.serviceTypes && filters.serviceTypes.length > 0) {
      const serviceFilters = filters.serviceTypes.map(service => 
        `FIND("${service}", {ServicesType}) > 0`
      );
      filterFormula.push(`OR(${serviceFilters.join(', ')})`);
    }

    const formula = filterFormula.length > 0 ? `AND(${filterFormula.join(', ')})` : undefined;
    console.log('📝 Airtable filter formula:', formula);

    const records = await base(VENDORS_TABLE).select({
      filterByFormula: formula,
      sort: [{ field: 'Name', direction: 'asc' }]
    }).all();
    
    console.log(`📊 Raw Airtable records found: ${records.length}`);

    let vendors = records.map((record, index) => {
      const vendor = {
        id: record.id,
        name: record.get('Name') as string,
        phone: record.get('Phone') as string,
        email: record.get('Email') as string,
        website: record.get('Website') as string,
        address: record.get('Address') as string,
        city: record.get('City') as string,
        state: record.get('State') as string,
        stateCode: record.get('StateCode') as string,
        latitude: record.get('Latitude') as number,
        longitude: record.get('Longitude') as number,
        serviceTypes: (record.get('ServicesType') as string || '').split(',').filter(Boolean),
        species: (record.get('Species') as string || '').split(',').filter(Boolean),
        serviceRadius: record.get('ServiceRadius') as number || 25,
        description: record.get('Description') as string || '',
        status: record.get('Status') as 'Active' | 'Pending' | 'Inactive',
        emergencyService: record.get('EmergencyService') as boolean || false,
        insuranceCertified: record.get('InsuranceCertified') as boolean || false,
        businessHours: record.get('BusinessHours') as string || '',
        featuredImage: (() => {
          const imageField = record.get('FeaturedImage') as any;
          const vendorName = record.get('Name') as string;
          if (Array.isArray(imageField) && imageField.length > 0) {
            return imageField[0].url;
          }
          return '';
        })(),
        createdAt: record.get('CreatedAt') as string || new Date().toISOString(),
        updatedAt: record.get('UpdatedAt') as string || new Date().toISOString()
      };
      
      // Log the first few vendors for debugging
      if (index < 3) {
        console.log(`🏢 Vendor ${index + 1}:`, {
          id: vendor.id,
          name: vendor.name,
          city: vendor.city,
          state: vendor.state,
          status: vendor.status,
          lat: vendor.latitude,
          lng: vendor.longitude
        });
      }
      
      return vendor;
    });

    // Filter by location if provided
    if (filters.location) {
      const { lat, lng, radius = 100 } = filters.location;
      vendors = vendors.filter(vendor => {
        if (!vendor.latitude || !vendor.longitude) return false;
        const distance = calculateDistance(lat, lng, vendor.latitude, vendor.longitude);
        return distance <= Math.min(radius, vendor.serviceRadius);
      });
    }

    console.log(`✅ Final vendor count: ${vendors.length}`);
    return vendors;
  } catch (error) {
    console.error('❌ Error fetching vendors:', error);
    console.error('📋 Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      airtableConfig: {
        hasApiKey: !!process.env.AIRTABLE_API_KEY,
        hasBaseId: !!process.env.AIRTABLE_BASE_ID,
        table: VENDORS_TABLE
      }
    });
    throw error; // Re-throw to see the error in the API
  }
}

export async function getVendorById(id: string): Promise<Vendor | null> {
  try {
    const record = await base(VENDORS_TABLE).find(id);
    
    return {
      id: record.id,
      name: record.get('Name') as string,
      phone: record.get('Phone') as string,
      email: record.get('Email') as string,
      website: record.get('Website') as string,
      address: record.get('Address') as string,
      city: record.get('City') as string,
      state: record.get('State') as string,
      stateCode: record.get('StateCode') as string,
      latitude: record.get('Latitude') as number,
      longitude: record.get('Longitude') as number,
      serviceTypes: (record.get('ServicesType') as string || '').split(',').filter(Boolean),
      species: (record.get('Species') as string || '').split(',').filter(Boolean),
      serviceRadius: record.get('ServiceRadius') as number || 25,
      description: record.get('Description') as string || '',
      status: record.get('Status') as 'Active' | 'Pending' | 'Inactive',
      emergencyService: record.get('EmergencyService') as boolean || false,
      insuranceCertified: record.get('InsuranceCertified') as boolean || false,
      businessHours: record.get('BusinessHours') as string || '',
      featuredImage: (() => {
        const imageField = record.get('FeaturedImage') as any;
        if (Array.isArray(imageField) && imageField.length > 0) {
          return imageField[0].url;
        }
        return imageField as string || '';
      })(),
      createdAt: record.get('CreatedAt') as string || new Date().toISOString(),
      updatedAt: record.get('UpdatedAt') as string || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching vendor:', error);
    return null;
  }
}

export async function createVendor(vendorData: Partial<Vendor>): Promise<string | null> {
  try {
    const record = await base(VENDORS_TABLE).create({
      Name: vendorData.name,
      Phone: vendorData.phone,
      Email: vendorData.email,
      Website: vendorData.website,
      Address: vendorData.address,
      City: vendorData.city,
      State: vendorData.state,
      StateCode: vendorData.stateCode,
      Latitude: vendorData.latitude,
      Longitude: vendorData.longitude,
      ServicesType: vendorData.serviceTypes?.join(','),
      Species: vendorData.species?.join(','),
      ServiceRadius: vendorData.serviceRadius || 25,
      Description: vendorData.description,
      Status: vendorData.status || 'Pending',
      EmergencyService: vendorData.emergencyService || false,
      InsuranceCertified: vendorData.insuranceCertified || false,
      BusinessHours: vendorData.businessHours,
      FeaturedImage: vendorData.featuredImage,
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString()
    });
    
    return record.id;
  } catch (error) {
    console.error('Error creating vendor:', error);
    return null;
  }
}

export async function submitVendor(submissionData: Omit<VendorSubmission, 'id' | 'submittedAt' | 'submissionStatus'>): Promise<string | null> {
  try {
    const record = await base(SUBMISSIONS_TABLE).create({
      BusinessName: submissionData.businessName,
      ContactName: submissionData.contactName,
      Phone: submissionData.phone,
      Email: submissionData.email,
      Address: submissionData.address,
      Services: submissionData.services.join(','),
      Description: submissionData.description,
      Website: submissionData.website,
      ServiceRadius: submissionData.serviceRadius || 25,
      EmergencyService: submissionData.emergencyService || false,
      SubmissionStatus: 'Pending',
      SubmittedAt: new Date().toISOString(),
      SubmitterIP: submissionData.submitterIP
    });
    
    return record.id;
  } catch (error) {
    console.error('Error submitting vendor:', error);
    return null;
  }
}

export async function getPendingSubmissions(): Promise<VendorSubmission[]> {
  try {
    const records = await base(SUBMISSIONS_TABLE).select({
      filterByFormula: '{SubmissionStatus} = "Pending"',
      sort: [{ field: 'SubmittedAt', direction: 'desc' }]
    }).all();

    return records.map(record => ({
      id: record.id,
      businessName: record.get('BusinessName') as string,
      contactName: record.get('ContactName') as string,
      phone: record.get('Phone') as string,
      email: record.get('Email') as string,
      address: record.get('Address') as string,
      services: (record.get('Services') as string || '').split(',').filter(Boolean),
      description: record.get('Description') as string,
      website: record.get('Website') as string,
      serviceRadius: record.get('ServiceRadius') as number,
      emergencyService: record.get('EmergencyService') as boolean,
      submissionStatus: record.get('SubmissionStatus') as 'Pending' | 'Approved' | 'Rejected',
      submittedAt: record.get('SubmittedAt') as string,
      submitterIP: record.get('SubmitterIP') as string
    }));
  } catch (error) {
    console.error('Error fetching pending submissions:', error);
    return [];
  }
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
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