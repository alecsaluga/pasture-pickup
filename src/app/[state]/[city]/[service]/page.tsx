import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCityInState, getServiceBySlug, SERVICE_DISPLAY_NAMES } from '@/lib/locations';
import { getVendors } from '@/lib/airtable';
import { VendorMap } from '@/components/VendorMap';
import { MapPin, Phone, Clock, Users, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface ServicePageProps {
  params: {
    state: string;
    city: string;
    service: string;
  };
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { state, city, service: serviceParam } = await params;
  const location = getCityInState(state, city);
  const service = getServiceBySlug(serviceParam);
  
  if (!location || !service) {
    return {
      title: 'Service Not Found',
      description: 'The requested service could not be found.'
    };
  }

  const { city, state } = location;
  const serviceName = SERVICE_DISPLAY_NAMES[service as keyof typeof SERVICE_DISPLAY_NAMES];

  return {
    title: `${serviceName} in ${city}, ${state.name} | Pasture Pickup`,
    description: `Professional ${serviceName.toLowerCase()} services in ${city}, ${state.name}. Licensed, insured providers available 24/7. Emergency response and same-day service available.`,
    openGraph: {
      title: `${serviceName} in ${city}, ${state.name}`,
      description: `Professional ${serviceName.toLowerCase()} services in ${city}, ${state.name}. Licensed, insured providers available 24/7.`,
      type: 'website',
      locale: 'en_US',
      siteName: 'Pasture Pickup'
    },
    twitter: {
      card: 'summary_large_image',
      title: `${serviceName} in ${city}, ${state.name}`,
      description: `Professional ${serviceName.toLowerCase()} services in ${city}, ${state.name}. Licensed, insured providers available 24/7.`
    },
    alternates: {
      canonical: `/${state}/${city}/${serviceParam}`
    }
  };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { state: stateParam, city: cityParam, service: serviceParam } = await params;
  const location = getCityInState(stateParam, cityParam);
  const service = getServiceBySlug(serviceParam);
  
  if (!location || !service) {
    notFound();
  }

  const { city, state } = location;
  const serviceName = SERVICE_DISPLAY_NAMES[service as keyof typeof SERVICE_DISPLAY_NAMES];

  // Fetch vendors that offer this specific service
  const allVendors = await getVendors({ status: 'Active' });
  const serviceVendors = allVendors.filter(vendor => {
    const vendorServices = vendor.serviceTypes.map(s => s.toLowerCase());
    const searchService = serviceName.toLowerCase();
    return vendor.stateCode === state.code && 
           vendorServices.some(vs => vs.includes(searchService.split(' ')[0]));
  });

  // Prioritize vendors in the specific city
  const cityVendors = serviceVendors.filter(v => 
    v.city.toLowerCase() === city.toLowerCase()
  );
  const nearbyVendors = serviceVendors.filter(v => 
    v.city.toLowerCase() !== city.toLowerCase()
  ).slice(0, 3);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": serviceName,
    "description": `Professional ${serviceName.toLowerCase()} services in ${city}, ${state.name}`,
    "provider": {
      "@type": "Organization",
      "name": "Pasture Pickup"
    },
    "areaServed": {
      "@type": "City",
      "name": city,
      "containedInPlace": {
        "@type": "State",
        "name": state.name
      }
    },
    "availableChannel": {
      "@type": "ServiceChannel",
      "serviceUrl": `https://pasturepickup.com/${stateParam}/${cityParam}/${serviceParam}`,
      "serviceSmsNumber": "+1234567890"
    },
    "hoursAvailable": "24/7"
  };

  // Service-specific content
  const getServiceContent = (service: string, city: string, state: string) => {
    switch (service) {
      case 'dead-horse-removal':
        return {
          description: `Professional dead horse removal services in ${city}, ${state}. Our licensed providers handle equine removal with dignity and respect, ensuring proper disposal according to state regulations.`,
          urgency: 'Immediate response required for health and safety.',
          process: [
            'Call for immediate emergency response',
            'Licensed technician dispatched to location',
            'Respectful removal using proper equipment',
            'Legal disposal at approved facilities',
            'Site cleanup and sanitization'
          ],
          considerations: [
            'Horse removal requires specialized equipment',
            'Proper handling prevents contamination',
            'State regulations must be followed',
            'Emergency service available 24/7'
          ]
        };
      case 'dead-cattle-removal':
        return {
          description: `Professional dead cattle removal services in ${city}, ${state}. Expert handling of bovine removal with proper equipment and procedures for safe, legal disposal.`,
          urgency: 'Quick response needed to prevent disease spread.',
          process: [
            'Emergency call and assessment',
            'Heavy equipment deployed for removal',
            'Safe transport to approved facilities',
            'Environmental protection measures',
            'Documentation for records'
          ],
          considerations: [
            'Cattle require heavy-duty removal equipment',
            'Bio-security measures are essential',
            'Proper disposal prevents disease spread',
            'Weather conditions affect timeline'
          ]
        };
      default:
        return {
          description: `Professional ${serviceName.toLowerCase()} in ${city}, ${state}. Licensed providers offering comprehensive livestock removal services with emergency response capability.`,
          urgency: 'Prompt response recommended for health and safety.',
          process: [
            'Initial consultation and assessment',
            'Professional removal service',
            'Proper disposal procedures',
            'Site cleanup if needed',
            'Documentation and reporting'
          ],
          considerations: [
            'Licensed and insured providers only',
            'Proper equipment for safe removal',
            'Compliance with local regulations',
            'Emergency services available'
          ]
        };
    }
  };

  const serviceContent = getServiceContent(service, city, state.name);

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
              <li><Link href={`/${stateParam}/${cityParam}`} className="text-blue-600 hover:underline">{city}</Link></li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-600">{serviceName}</li>
            </ol>
          </nav>

          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {serviceName} in {city}, {state.name}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {serviceContent.description}
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-5 h-5 mr-2 text-blue-500" />
                {cityVendors.length + nearbyVendors.length} Available Provider{cityVendors.length + nearbyVendors.length !== 1 ? 's' : ''}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-5 h-5 mr-2 text-red-500" />
                24/7 Emergency Response
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
                {serviceContent.urgency}
              </div>
            </div>

            {/* Emergency CTA */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
              <h2 className="text-lg font-semibold text-red-900 mb-2">Need Immediate {serviceName}?</h2>
              <p className="text-red-800 mb-4">Emergency livestock removal available 24/7 in {city}, {state.name}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a 
                  href="tel:+1234567890"
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold inline-block text-center"
                >
                  <Phone className="w-5 h-5 inline mr-2" />
                  Call Emergency Line
                </a>
                <Link
                  href="#providers"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold inline-block text-center"
                >
                  View Local Providers
                </Link>
              </div>
            </div>
          </div>

          {/* Map Section */}
          {(cityVendors.length > 0 || nearbyVendors.length > 0) && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {serviceName} Providers Near {city}, {state.name}
              </h2>
              <VendorMap
                vendors={[...cityVendors, ...nearbyVendors]}
                height="h-[400px]"
                showSearch={true}
              />
            </div>
          )}

          {/* Service Process */}
          <div className="mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {serviceName} Process
                </h2>
                <ol className="space-y-4">
                  {serviceContent.process.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mr-4 mt-1">
                        {index + 1}
                      </span>
                      <span className="text-gray-700 pt-1">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Important Considerations
                </h2>
                <ul className="space-y-3">
                  {serviceContent.considerations.map((consideration, index) => (
                    <li key={index} className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-orange-500 mr-3 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{consideration}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Provider Listings */}
          <div id="providers" className="mb-12">
            {cityVendors.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Local {serviceName} Providers in {city}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cityVendors.map(vendor => (
                    <div key={vendor.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{vendor.name}</h3>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          Local Provider
                        </span>
                      </div>
                      
                      {vendor.emergencyService && (
                        <div className="bg-red-50 text-red-800 text-xs px-2 py-1 rounded mb-3 inline-block">
                          24/7 Emergency Available
                        </div>
                      )}
                      
                      <p className="text-gray-600 mb-2 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {vendor.city}, {vendor.stateCode}
                      </p>
                      
                      <p className="text-sm text-gray-600 mb-4">{vendor.description}</p>
                      
                      <div className="flex gap-2">
                        <a
                          href={`tel:${vendor.phone}`}
                          className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                          onClick={() => {
                            if (typeof window !== 'undefined' && window.gtag) {
                              window.gtag('event', 'vendor_contact', {
                                vendor_name: vendor.name,
                                contact_method: 'phone',
                                service_type: serviceName,
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

            {nearbyVendors.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Nearby {serviceName} Providers Serving {city}
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
                      
                      <p className="text-sm text-gray-600 mb-4">{vendor.description}</p>
                      
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
          </div>

          {/* No Providers Found */}
          {cityVendors.length === 0 && nearbyVendors.length === 0 && (
            <div className="text-center py-12">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No {serviceName} Providers Found in {city}
                </h3>
                <p className="text-gray-600">
                  We're working to add more {serviceName.toLowerCase()} providers in the {city} area.
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
                <h4 className="text-lg font-medium text-blue-900 mb-2">Need {serviceName} Now?</h4>
                <p className="text-blue-800 mb-4 text-sm">
                  Contact Gentle Goodbye Equine for professional {serviceName.toLowerCase()} in the {city} area.
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
              {serviceName} FAQ for {city}, {state.name}
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How quickly can I get {serviceName.toLowerCase()} in {city}?
                </h3>
                <p className="text-gray-600">
                  Most providers in {city} offer same-day or emergency response for {serviceName.toLowerCase()}. 
                  Call immediately for the fastest service.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What does {serviceName.toLowerCase()} cost in {city}, {state.name}?
                </h3>
                <p className="text-gray-600">
                  Costs vary based on animal size, location accessibility, and urgency. Most providers 
                  offer free quotes and transparent pricing before beginning service.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Are {serviceName.toLowerCase()} providers in {city} licensed?
                </h3>
                <p className="text-gray-600">
                  All providers in our directory are required to be properly licensed and insured. 
                  We verify credentials before listing any {serviceName.toLowerCase()} business.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What should I do while waiting for {serviceName.toLowerCase()} in {city}?
                </h3>
                <p className="text-gray-600">
                  Keep people and animals away from the area, avoid moving the deceased animal, 
                  and provide clear directions to help the removal team locate your property quickly.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}