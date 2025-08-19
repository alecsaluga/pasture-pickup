import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCityInState, LIVESTOCK_SERVICES, SERVICE_DISPLAY_NAMES } from '@/lib/locations';
import { getVendors } from '@/lib/airtable';
import { VendorMap } from '@/components/VendorMap';
import { MapPin, Phone, Clock, Users } from 'lucide-react';
import Link from 'next/link';

interface CityPageProps {
  params: {
    state: string;
    city: string;
  };
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { state, city } = await params;
  const location = getCityInState(state, city);
  
  if (!location) {
    return {
      title: 'City Not Found',
      description: 'The requested city could not be found.'
    };
  }

  const { city, state } = location;

  return {
    title: `Livestock Removal Services in ${city}, ${state.name} | Pasture Pickup`,
    description: `Find professional livestock removal services in ${city}, ${state.name}. Licensed providers for dead horse removal, cattle removal, and emergency livestock services. Available 24/7.`,
    openGraph: {
      title: `Livestock Removal Services in ${city}, ${state.name}`,
      description: `Professional livestock removal services in ${city}, ${state.name}. Licensed, insured providers available 24/7.`,
      type: 'website',
      locale: 'en_US',
      siteName: 'Pasture Pickup'
    },
    twitter: {
      card: 'summary_large_image',
      title: `Livestock Removal Services in ${city}, ${state.name}`,
      description: `Professional livestock removal services in ${city}, ${state.name}. Licensed, insured providers available 24/7.`
    },
    alternates: {
      canonical: `/${state}/${city}`
    }
  };
}

export default async function CityPage({ params }: CityPageProps) {
  const { state: stateParam, city: cityParam } = await params;
  const location = getCityInState(stateParam, cityParam);
  
  if (!location) {
    notFound();
  }

  const { city, state } = location;

  // Fetch vendors for this city and surrounding areas
  const allVendors = await getVendors({ status: 'Active' });
  const cityVendors = allVendors.filter(vendor => 
    vendor.city.toLowerCase() === city.toLowerCase() && vendor.stateCode === state.code
  );
  
  // Also get nearby vendors within 100 miles
  const nearbyVendors = allVendors.filter(vendor => 
    vendor.stateCode === state.code && 
    vendor.city.toLowerCase() !== city.toLowerCase()
  ).slice(0, 3);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": `Livestock Removal Services in ${city}, ${state.name}`,
    "description": `Professional livestock removal services in ${city}, ${state.name}. Licensed, insured providers available 24/7.`,
    "url": `https://pasturepickup.com/${params.state}/${params.city}`,
    "mainEntity": {
      "@type": "Service",
      "name": "Livestock Removal Services",
      "areaServed": {
        "@type": "City",
        "name": city,
        "containedInPlace": {
          "@type": "State",
          "name": state.name
        }
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
              <li><Link href={`/${stateParam}`} className="text-blue-600 hover:underline">{state.name}</Link></li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-600">{city}</li>
            </ol>
          </nav>

          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Livestock Removal Services in {city}, {state.name}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Professional livestock removal services in {city}, {state.name}. Connect with licensed, 
              insured providers for emergency livestock removal, dead horse removal, and farm cleanup services.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-5 h-5 mr-2 text-blue-500" />
                {cityVendors.length} Local Provider{cityVendors.length !== 1 ? 's' : ''}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-5 h-5 mr-2 text-red-500" />
                24/7 Emergency Service
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-5 h-5 mr-2 text-green-500" />
                Same-Day Response
              </div>
            </div>
          </div>

          {/* Map Section */}
          {(cityVendors.length > 0 || nearbyVendors.length > 0) && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Livestock Removal Providers Near {city}, {state.name}
              </h2>
              <VendorMap
                vendors={[...cityVendors, ...nearbyVendors]}
                height="h-[400px]"
                showSearch={true}
              />
            </div>
          )}

          {/* Services Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Livestock Removal Services in {city}, {state.name}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {LIVESTOCK_SERVICES.map(service => (
                <Link
                  key={service}
                  href={`/${stateParam}/${cityParam}/${service}`}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {SERVICE_DISPLAY_NAMES[service as keyof typeof SERVICE_DISPLAY_NAMES]}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Professional {SERVICE_DISPLAY_NAMES[service as keyof typeof SERVICE_DISPLAY_NAMES].toLowerCase()} in {city}, {state.name}
                  </p>
                  <span className="text-blue-600 text-sm font-medium">
                    Find Local Providers →
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Local Vendor Listings */}
          {cityVendors.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Local Livestock Removal Providers in {city}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cityVendors.map(vendor => (
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
                        onClick={() => {
                          if (typeof window !== 'undefined' && window.gtag) {
                            window.gtag('event', 'vendor_contact', {
                              vendor_name: vendor.name,
                              contact_method: 'phone',
                              location: `${city}, ${state.name}`
                            });
                          }
                        }}
                      >
                        <Phone className="w-4 h-4 inline mr-1" />
                        Call Now
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
            </div>
          )}

          {/* Nearby Vendors */}
          {nearbyVendors.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Nearby Providers Serving {city}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nearbyVendors.map(vendor => (
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
                        Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Vendors Found */}
          {cityVendors.length === 0 && nearbyVendors.length === 0 && (
            <div className="text-center py-12">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Local Providers Found</h3>
                <p className="text-gray-600">
                  We're working to add more livestock removal providers in the {city} area.
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
                <h4 className="text-lg font-medium text-blue-900 mb-2">Need Immediate Help?</h4>
                <p className="text-blue-800 mb-4 text-sm">
                  Contact Gentle Goodbye Equine for professional livestock removal services in the {city} area.
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

          {/* Local Information */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Livestock Removal Information for {city}, {state.name}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Response</h3>
                <p className="text-gray-600 mb-4">
                  Most providers serving {city} offer same-day emergency response for livestock removal. 
                  Call immediately when you discover deceased livestock to prevent health and environmental issues.
                </p>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Local Regulations</h3>
                <p className="text-gray-600">
                  {city} follows {state.name} state regulations for livestock disposal. Licensed providers 
                  will ensure proper handling and disposal according to local health department requirements.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">What to Expect</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• Quick response times in the {city} area</li>
                  <li>• Professional, respectful service</li>
                  <li>• Proper equipment and vehicles</li>
                  <li>• Licensed and insured providers</li>
                  <li>• Transparent pricing and quotes</li>
                </ul>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Service Areas</h3>
                <p className="text-gray-600">
                  Providers serving {city} typically cover surrounding areas within a 50-100 mile radius, 
                  including rural and farm locations throughout {state.name}.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}