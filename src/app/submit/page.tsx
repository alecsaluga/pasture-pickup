'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { LocationSearch } from '@/components/LocationSearch';
import { SERVICE_TYPES, LIVESTOCK_SPECIES, Location } from '@/types/vendor';
import { MapPin, Phone, Mail, Globe, Building, FileText } from 'lucide-react';
import Link from 'next/link';

interface SubmissionForm {
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  website?: string;
  description: string;
  services: string[];
  species: string[];
  serviceRadius: number;
  emergencyService: boolean;
  businessHours: string;
}

export default function SubmitVendor() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<SubmissionForm>({
    defaultValues: {
      serviceRadius: 25,
      emergencyService: false,
      services: [],
      species: []
    }
  });

  const selectedServices = watch('services') || [];
  const selectedSpecies = watch('species') || [];

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setValue('address', location.address);
  };

  const onSubmit = async (data: SubmissionForm) => {
    if (!selectedLocation) {
      setError('Please select a valid address using the location search.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const submissionData = {
        ...data,
        address: selectedLocation.address,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng
      };

      const response = await fetch('/api/submit-vendor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit vendor');
      }

      setSubmitted(true);
      
      // Track submission
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'vendor_submission', {
          event_category: 'Engagement',
          event_label: data.businessName,
          business_type: data.services.join(',')
        });
      }
    } catch (err) {
      setError('Failed to submit your business. Please try again.');
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Pasture Pickup
            </Link>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Submission Received!</h1>
              <p className="text-gray-600">
                Thank you for submitting your livestock removal business to our directory.
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">What happens next?</h2>
              <ul className="text-left text-blue-800 text-sm space-y-1">
                <li>• Our team will review your submission within 1-2 business days</li>
                <li>• We'll verify your business information and licensing</li>
                <li>• Once approved, your business will appear in search results</li>
                <li>• You'll receive an email confirmation when your listing goes live</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <Link
                href="/"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Return to Homepage
              </Link>
              <p className="text-sm text-gray-500">
                Questions? Contact us at{' '}
                <a href="mailto:support@pasturepickup.com" className="text-blue-600 hover:underline">
                  support@pasturepickup.com
                </a>
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Pasture Pickup
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
              <Link href="/map" className="text-gray-600 hover:text-gray-900">Map</Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Submit Your Livestock Removal Business
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join our directory and connect with customers who need professional livestock removal services. 
            All submissions are reviewed for quality and licensing before approval.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Information */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Business Information
              </h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name *
              </label>
              <input
                type="text"
                {...register('businessName', { required: 'Business name is required' })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ABC Livestock Removal"
              />
              {errors.businessName && (
                <p className="text-red-600 text-sm mt-1">{errors.businessName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Person *
              </label>
              <input
                type="text"
                {...register('contactName', { required: 'Contact name is required' })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Smith"
              />
              {errors.contactName && (
                <p className="text-red-600 text-sm mt-1">{errors.contactName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Phone className="w-4 h-4 mr-1" />
                Phone Number *
              </label>
              <input
                type="tel"
                {...register('phone', { 
                  required: 'Phone number is required',
                  pattern: {
                    value: /^[\+]?[\s\-\(\)]*[0-9][\s\-\(\)0-9]*$/,
                    message: 'Please enter a valid phone number'
                  }
                })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="(555) 123-4567"
              />
              {errors.phone && (
                <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Mail className="w-4 h-4 mr-1" />
                Email Address *
              </label>
              <input
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email address'
                  }
                })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="john@abcremoval.com"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Globe className="w-4 h-4 mr-1" />
                Website (Optional)
              </label>
              <input
                type="url"
                {...register('website')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://www.abcremoval.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Hours
              </label>
              <input
                type="text"
                {...register('businessHours')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Monday-Friday 8AM-6PM, Emergency 24/7"
              />
            </div>

            {/* Location */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Business Location
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Address *
                </label>
                <LocationSearch
                  onLocationSelect={handleLocationSelect}
                  placeholder="Start typing your business address..."
                  className="mb-2"
                />
                {selectedLocation && (
                  <div className="text-sm text-green-600">
                    ✓ Selected: {selectedLocation.address}
                  </div>
                )}
                {!selectedLocation && (
                  <p className="text-sm text-gray-500">
                    Please use the search above to select your exact business address
                  </p>
                )}
              </div>
            </div>

            {/* Services */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Services Offered *</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SERVICE_TYPES.map(service => (
                  <label key={service} className="flex items-center">
                    <input
                      type="checkbox"
                      value={service}
                      {...register('services', { required: 'Please select at least one service' })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{service}</span>
                  </label>
                ))}
              </div>
              {errors.services && (
                <p className="text-red-600 text-sm mt-1">{errors.services.message}</p>
              )}
            </div>

            {/* Species */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Livestock Species Handled</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {LIVESTOCK_SPECIES.map(species => (
                  <label key={species} className="flex items-center">
                    <input
                      type="checkbox"
                      value={species}
                      {...register('species')}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{species}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Service Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Radius (miles) *
              </label>
              <input
                type="number"
                min="5"
                max="200"
                {...register('serviceRadius', { 
                  required: 'Service radius is required',
                  min: { value: 5, message: 'Minimum radius is 5 miles' },
                  max: { value: 200, message: 'Maximum radius is 200 miles' }
                })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.serviceRadius && (
                <p className="text-red-600 text-sm mt-1">{errors.serviceRadius.message}</p>
              )}
            </div>

            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('emergencyService')}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  24/7 Emergency Service Available
                </span>
              </label>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Description *
              </label>
              <textarea
                {...register('description', { 
                  required: 'Business description is required',
                  minLength: { value: 50, message: 'Description must be at least 50 characters' }
                })}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your livestock removal services, experience, certifications, and what makes your business unique..."
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Minimum 50 characters. Include information about licensing, insurance, and specialties.
              </p>
            </div>
          </div>

          {/* Terms */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Before You Submit</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• All information will be reviewed for accuracy before approval</li>
              <li>• You must be properly licensed and insured for livestock removal</li>
              <li>• Listings are free, but we reserve the right to remove inappropriate content</li>
              <li>• You'll receive email notifications about your submission status</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="mt-8 text-center">
            <button
              type="submit"
              disabled={isSubmitting || !selectedLocation}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Business for Review'}
            </button>
            
            {!selectedLocation && (
              <p className="text-sm text-red-600 mt-2">
                Please select a valid address using the location search above
              </p>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}