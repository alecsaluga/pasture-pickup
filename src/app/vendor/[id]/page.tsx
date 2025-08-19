import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getVendorById } from '@/lib/airtable';
import { VendorMap } from '@/components/VendorMap';
import { MapPin, Phone, Globe, Clock, Shield, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface VendorPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: VendorPageProps): Promise<Metadata> {
  const { id } = await params;
  const vendor = await getVendorById(id);
  
  if (!vendor) {
    return {
      title: 'Vendor Not Found',
      description: 'The requested vendor could not be found.'
    };
  }

  const primaryService = vendor.serviceTypes[0] || 'Livestock Removal';
  
  return {
    title: `${vendor.name} - ${primaryService} in ${vendor.city}, ${vendor.state} | Pasture Pickup`,
    description: `Professional ${primaryService.toLowerCase()} services in ${vendor.city}, ${vendor.state}. ${vendor.description} Contact ${vendor.name} for reliable, licensed livestock removal.`,
    openGraph: {
      title: `${vendor.name} - ${primaryService} in ${vendor.city}, ${vendor.state}`,
      description: vendor.description,
      type: 'website',
      locale: 'en_US',
      siteName: 'Pasture Pickup',
      images: vendor.featuredImage ? [{
        url: vendor.featuredImage,
        width: 1200,
        height: 630,
        alt: `${vendor.name} - Livestock Removal Services`
      }] : []
    },
    twitter: {
      card: 'summary_large_image',
      title: `${vendor.name} - ${primaryService} in ${vendor.city}, ${vendor.state}`,
      description: vendor.description,
      images: vendor.featuredImage ? [vendor.featuredImage] : []
    },
    alternates: {
      canonical: `/vendor/${vendor.id}`
    }
  };
}

export default async function VendorPage({ params }: VendorPageProps) {
  const { id } = await params;
  const vendor = await getVendorById(id);
  
  if (!vendor || vendor.status !== 'Active') {
    notFound();
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": vendor.name,
    "description": vendor.description,
    "image": vendor.featuredImage,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": vendor.address,
      "addressLocality": vendor.city,
      "addressRegion": vendor.state,
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": vendor.latitude,
      "longitude": vendor.longitude
    },
    "telephone": vendor.phone,
    "email": vendor.email,
    "url": vendor.website,
    "openingHours": vendor.businessHours,
    "serviceArea": {
      "@type": "GeoCircle",
      "geoRadius": `${vendor.serviceRadius} miles`,
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": vendor.latitude,
        "longitude": vendor.longitude
      }
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Livestock Removal Services",
      "itemListElement": vendor.serviceTypes.map(service => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": service,
          "provider": {
            "@type": "LocalBusiness",
            "name": vendor.name
          }
        }
      }))
    },
    "areaServed": {
      "@type": "State",
      "name": vendor.state
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
              <li><Link href={`/${vendor.stateCode.toLowerCase()}`} className="text-blue-600 hover:underline">{vendor.state}</Link></li>
              <li className="text-gray-400">/</li>
              <li><Link href={`/${vendor.stateCode.toLowerCase()}/${vendor.city.toLowerCase().replace(/\s+/g, '-')}`} className="text-blue-600 hover:underline">{vendor.city}</Link></li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-600">{vendor.name}</li>
            </ol>
          </nav>

          {/* Vendor Header */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {vendor.name}
                    </h1>
                    <p className="text-lg text-gray-600 flex items-center mb-2">
                      <MapPin className="w-5 h-5 mr-2" />
                      {vendor.city}, {vendor.state}
                    </p>
                  </div>
                  {vendor.emergencyService && (
                    <span className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full">
                      24/7 Emergency Service
                    </span>
                  )}
                </div>
                
                <p className="text-gray-700 mb-6">{vendor.description}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <a
                    href={`tel:${vendor.phone}`}
                    className="flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.gtag) {
                        window.gtag('event', 'vendor_contact', {
                          vendor_name: vendor.name,
                          contact_method: 'phone',
                          location: `${vendor.city}, ${vendor.stateCode}`
                        });
                      }
                    }}
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    {vendor.phone}
                  </a>
                  
                  {vendor.website && (
                    <a
                      href={vendor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                      onClick={() => {
                        if (typeof window !== 'undefined' && window.gtag) {
                          window.gtag('event', 'vendor_contact', {
                            vendor_name: vendor.name,
                            contact_method: 'website',
                            location: `${vendor.city}, ${vendor.stateCode}`
                          });
                        }
                      }}
                    >
                      <Globe className="w-5 h-5 mr-2" />
                      Visit Website
                    </a>
                  )}
                </div>
                
                {/* Trust Signals */}
                <div className="flex flex-wrap gap-4">
                  {vendor.insuranceCertified && (
                    <div className="flex items-center text-sm text-green-700">
                      <Shield className="w-4 h-4 mr-2" />
                      Licensed & Insured
                    </div>
                  )}
                  {vendor.emergencyService && (
                    <div className="flex items-center text-sm text-red-700">
                      <Clock className="w-4 h-4 mr-2" />
                      Emergency Available
                    </div>
                  )}
                  <div className="flex items-center text-sm text-blue-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verified Vendor
                  </div>
                </div>
              </div>
              
              {/* Vendor Image */}
              <div>
                {vendor.featuredImage ? (
                  <img
                    src={vendor.featuredImage}
                    alt={`${vendor.name} - Livestock Removal Services`}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <MapPin className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Services & Details */}
            <div className="lg:col-span-2">
              {/* Services */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Services Offered</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {vendor.serviceTypes.map(service => (
                    <div key={service} className="flex items-center bg-blue-50 p-3 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-blue-600 mr-3" />
                      <span className="text-gray-800">{service}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Species Handled */}
              {vendor.species.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Livestock Species</h2>
                  <div className="flex flex-wrap gap-2">
                    {vendor.species.map(species => (
                      <span key={species} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        {species}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Service Area Map */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Service Area</h2>
                <VendorMap
                  vendors={[vendor]}
                  height="h-80"
                  showSearch={false}
                />
                <p className="text-sm text-gray-600 mt-2">
                  Service radius: {vendor.serviceRadius} miles from {vendor.city}, {vendor.state}
                </p>
              </div>
            </div>

            {/* Contact Info Sidebar */}
            <div>
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Phone</h3>
                    <a
                      href={`tel:${vendor.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {vendor.phone}
                    </a>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Email</h3>
                    <a
                      href={`mailto:${vendor.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {vendor.email}
                    </a>
                  </div>
                  
                  {vendor.website && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-1">Website</h3>
                      <a
                        href={vendor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {vendor.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Address</h3>
                    <p className="text-gray-600">{vendor.address}</p>
                  </div>
                  
                  {vendor.businessHours && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-1">Business Hours</h3>
                      <p className="text-gray-600">{vendor.businessHours}</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                    onClick={() => {
                      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(vendor.address)}`;
                      window.open(mapsUrl, '_blank');
                      
                      if (typeof window !== 'undefined' && window.gtag) {
                        window.gtag('event', 'vendor_contact', {
                          vendor_name: vendor.name,
                          contact_method: 'directions',
                          location: `${vendor.city}, ${vendor.stateCode}`
                        });
                      }
                    }}
                  >
                    <MapPin className="w-5 h-5 mr-2" />
                    Get Directions
                  </button>
                </div>
              </div>

              {/* Related Services */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Looking for Other Services?</h2>
                <div className="space-y-3">
                  <Link
                    href={`/${vendor.stateCode.toLowerCase()}/${vendor.city.toLowerCase().replace(/\s+/g, '-')}/dead-horse-removal`}
                    className="block text-blue-600 hover:underline text-sm"
                  >
                    Dead Horse Removal in {vendor.city}
                  </Link>
                  <Link
                    href={`/${vendor.stateCode.toLowerCase()}/${vendor.city.toLowerCase().replace(/\s+/g, '-')}/dead-cattle-removal`}
                    className="block text-blue-600 hover:underline text-sm"
                  >
                    Dead Cattle Removal in {vendor.city}
                  </Link>
                  <Link
                    href={`/${vendor.stateCode.toLowerCase()}/livestock-removal-services`}
                    className="block text-blue-600 hover:underline text-sm"
                  >
                    All Services in {vendor.state}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}