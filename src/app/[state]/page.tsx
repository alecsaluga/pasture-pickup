import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getStateBySlug, US_STATES, LIVESTOCK_SERVICES, SERVICE_DISPLAY_NAMES } from '@/lib/locations';
import { getVendors } from '@/lib/airtable';
import { VendorMap } from '@/components/VendorMap';
import { Vendor } from '@/types/vendor';
import { MapPin, Phone, Clock, Users } from 'lucide-react';
import Link from 'next/link';

interface StatePageProps {
  params: {
    state: string;
  };
}

export async function generateStaticParams() {
  return US_STATES.map(state => ({
    state: state.name.toLowerCase().replace(/\s+/g, '-')
  }));
}

export async function generateMetadata({ params }: StatePageProps): Promise<Metadata> {
  const { state: stateParam } = await params;
  const state = getStateBySlug(stateParam);
  
  if (!state) {
    return {
      title: 'State Not Found',
      description: 'The requested state could not be found.'
    };
  }

  return {
    title: `Livestock Removal Services in ${state.name} | Pasture Pickup`,
    description: `Find professional livestock removal services in ${state.name}. Connect with licensed providers for dead horse removal, cattle removal, and emergency livestock services across ${state.name}.`,
    openGraph: {
      title: `Livestock Removal Services in ${state.name}`,
      description: `Professional livestock removal services across ${state.name}. Licensed, insured providers available 24/7.`,
      type: 'website',
      locale: 'en_US',
      siteName: 'Pasture Pickup'
    },
    twitter: {
      card: 'summary_large_image',
      title: `Livestock Removal Services in ${state.name}`,
      description: `Professional livestock removal services across ${state.name}. Licensed, insured providers available 24/7.`
    },
    alternates: {
      canonical: `/${stateParam}`
    }
  };
}

export default async function StatePage({ params }: StatePageProps) {
  const { state: stateParam } = await params;
  const state = getStateBySlug(stateParam);
  
  if (!state) {
    notFound();
  }

  // Fetch vendors for this state
  const allVendors = await getVendors({ status: 'Active' });
  const stateVendors = allVendors.filter(vendor => vendor.stateCode === state.code);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": `Livestock Removal Services in ${state.name}`,
    "description": `Professional livestock removal services across ${state.name}. Licensed, insured providers available 24/7.`,
    "url": `https://pasturepickup.com/${stateParam}`,
    "mainEntity": {
      "@type": "Service",
      "name": "Livestock Removal Services",
      "areaServed": {
        "@type": "State",
        "name": state.name
      },
      "provider": {
        "@type": "Organization",
        "name": "Pasture Pickup"
      }
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
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                Pasture Pickup
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
                <Link href="/map" className="text-gray-600 hover:text-gray-900">Map</Link>
                <Link href="/submit" className="text-gray-600 hover:text-gray-900">Submit Business</Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumbs */}
          <nav className="mb-6 text-sm">
            <ol className="flex items-center space-x-2">
              <li><Link href="/" className="text-blue-600 hover:underline">Home</Link></li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-600">{state.name}</li>
            </ol>
          </nav>

          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Livestock Removal Services in {state.name}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Professional livestock removal services across {state.name}. Connect with licensed, 
              insured providers for emergency livestock removal, dead horse removal, and farm cleanup services.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-5 h-5 mr-2 text-blue-500" />
                {stateVendors.length} Licensed Providers
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-5 h-5 mr-2 text-red-500" />
                24/7 Emergency Service
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-5 h-5 mr-2 text-green-500" />
                Statewide Coverage
              </div>
            </div>
          </div>

          {/* Map Section */}
          {stateVendors.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Livestock Removal Providers in {state.name}
              </h2>
              <VendorMap
                vendors={stateVendors}
                height="h-[400px]"
                showSearch={true}
              />
            </div>
          )}

          {/* Services Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Livestock Removal Services in {state.name}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {LIVESTOCK_SERVICES.map(service => (
                <Link
                  key={service}
                  href={`/${stateParam}/${service}`}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {SERVICE_DISPLAY_NAMES[service as keyof typeof SERVICE_DISPLAY_NAMES]}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Professional {SERVICE_DISPLAY_NAMES[service as keyof typeof SERVICE_DISPLAY_NAMES].toLowerCase()} services across {state.name}
                  </p>
                  <span className="text-blue-600 text-sm font-medium">
                    View Providers →
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Major Cities Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Livestock Removal by City in {state.name}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {state.major_cities.map(city => {
                const citySlug = city.toLowerCase().replace(/\s+/g, '-');
                const cityVendors = stateVendors.filter(v => 
                  v.city.toLowerCase() === city.toLowerCase()
                );
                
                return (
                  <Link
                    key={city}
                    href={`/${stateParam}/${citySlug}`}
                    className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-semibold text-gray-900">{city}</h3>
                    <p className="text-sm text-gray-600">
                      {cityVendors.length} provider{cityVendors.length !== 1 ? 's' : ''}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Vendor Listings */}
          {stateVendors.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Featured Livestock Removal Providers
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stateVendors.slice(0, 6).map(vendor => (
                  <div key={vendor.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{vendor.name}</h3>
                      {vendor.emergencyService && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                          24/7 Emergency
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-2 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {vendor.city}, {vendor.stateCode}
                    </p>
                    
                    <p className="text-sm text-gray-600 mb-3">{vendor.description}</p>
                    
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Services:</p>
                      <p className="text-sm">{vendor.serviceTypes.join(', ')}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <a
                        href={`tel:${vendor.phone}`}
                        className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                      >
                        <Phone className="w-4 h-4 inline mr-1" />
                        Call
                      </a>
                      <Link
                        href={`/vendor/${vendor.id}`}
                        className="flex-1 bg-gray-200 text-gray-800 text-center py-2 px-4 rounded hover:bg-gray-300 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              
              {stateVendors.length > 6 && (
                <div className="text-center mt-6">
                  <Link
                    href="/map"
                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View All {stateVendors.length} Providers
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* No Vendors Found */}
          {stateVendors.length === 0 && (
            <div className="text-center py-12">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Providers Found in {state.name}</h3>
                <p className="text-gray-600">
                  We're working to add more livestock removal providers in {state.name}.
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
                <h4 className="text-lg font-medium text-blue-900 mb-2">Need Immediate Help?</h4>
                <p className="text-blue-800 mb-4 text-sm">
                  Contact Gentle Goodbye Equine for professional livestock removal services.
                </p>
                <a 
                  href="tel:+1234567890"
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Get Help Now
                </a>
              </div>
            </div>
          )}

          {/* FAQ Section */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions About Livestock Removal in {state.name}
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How quickly can someone remove dead livestock in {state.name}?
                </h3>
                <p className="text-gray-600">
                  Most providers in {state.name} offer same-day or next-day service. Emergency providers 
                  are available 24/7 for urgent situations.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What does livestock removal cost in {state.name}?
                </h3>
                <p className="text-gray-600">
                  Costs vary based on animal size, location, and urgency. Most providers offer free quotes 
                  and transparent pricing before service.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Do I need permits for livestock removal in {state.name}?
                </h3>
                <p className="text-gray-600">
                  Requirements vary by county. Licensed providers will handle necessary permits and 
                  ensure compliance with local regulations.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Are livestock removal providers in {state.name} licensed and insured?
                </h3>
                <p className="text-gray-600">
                  All providers in our directory are required to be properly licensed and insured. 
                  We verify credentials before listing any business.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}