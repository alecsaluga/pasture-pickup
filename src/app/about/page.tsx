import { Metadata } from 'next';
import Link from 'next/link';
import { Users, Shield, Clock, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Pasture Pickup - National Livestock Removal Directory',
  description: 'Learn about Pasture Pickup, the leading national directory connecting property owners with licensed livestock removal services. Professional, respectful, and available 24/7.',
  openGraph: {
    title: 'About Pasture Pickup - National Livestock Removal Directory',
    description: 'Learn about Pasture Pickup, the leading national directory connecting property owners with licensed livestock removal services.',
  },
  alternates: {
    canonical: '/about'
  }
};

export default function AboutPage() {
  return (
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
              <Link href="/about" className="text-blue-600 font-medium">About</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About Pasture Pickup
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The nation's premier directory connecting property owners with professional, 
            licensed livestock removal services. Available 24/7 across all 50 states.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            When livestock passes away, property owners face urgent health, legal, and environmental 
            concerns. Pasture Pickup was created to solve this critical need by connecting people 
            with licensed, professional removal services in their area.
          </p>
          <p className="text-gray-700 text-lg leading-relaxed">
            We believe that during difficult times, finding help should be simple, fast, and reliable. 
            Our platform ensures that property owners can quickly locate qualified professionals who 
            handle livestock removal with dignity, respect, and full compliance with local regulations.
          </p>
        </div>

        {/* Value Propositions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center mb-4">
              <Shield className="w-8 h-8 text-green-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Licensed & Verified</h3>
            </div>
            <p className="text-gray-700">
              Every provider in our directory is thoroughly vetted. We verify licensing, 
              insurance, and credentials to ensure you're working with qualified professionals.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center mb-4">
              <Clock className="w-8 h-8 text-red-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">24/7 Availability</h3>
            </div>
            <p className="text-gray-700">
              Livestock emergencies don't wait for business hours. Our network includes 
              providers offering round-the-clock emergency response services.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center mb-4">
              <MapPin className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Nationwide Coverage</h3>
            </div>
            <p className="text-gray-700">
              From rural farms to suburban properties, our directory covers all 50 states 
              with local providers who understand regional regulations and requirements.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center mb-4">
              <Users className="w-8 h-8 text-purple-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Respectful Service</h3>
            </div>
            <p className="text-gray-700">
              We understand the emotional difficulty of livestock loss. All our providers 
              are committed to handling every situation with dignity and compassion.
            </p>
          </div>
        </div>

        {/* How We Help Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How We Help</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">For Property Owners</h3>
              <ul className="text-gray-700 space-y-2">
                <li>• Quick location of local, licensed removal services</li>
                <li>• 24/7 emergency response options</li>
                <li>• Verified provider credentials and insurance</li>
                <li>• Direct contact with service providers</li>
                <li>• Guidance on legal requirements and best practices</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">For Service Providers</h3>
              <ul className="text-gray-700 space-y-2">
                <li>• Increased visibility in local markets</li>
                <li>• Connection with customers in need</li>
                <li>• Free business listing and profile</li>
                <li>• Quality leads from verified requests</li>
                <li>• Platform to showcase credentials and specialties</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Service Standards */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Service Standards</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Provider Requirements</h3>
              <ul className="text-gray-700 space-y-2">
                <li>• Valid business license and permits</li>
                <li>• Comprehensive liability insurance</li>
                <li>• Proper equipment and vehicles</li>
                <li>• Knowledge of local regulations</li>
                <li>• Professional conduct standards</li>
                <li>• Environmental compliance</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Expectations</h3>
              <ul className="text-gray-700 space-y-2">
                <li>• Prompt response to inquiries</li>
                <li>• Clear, upfront pricing</li>
                <li>• Professional appearance and conduct</li>
                <li>• Proper handling and disposal methods</li>
                <li>• Site cleanup when required</li>
                <li>• Documentation and record keeping</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Emergency Backup */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">When Local Providers Aren't Available</h2>
          <p className="text-blue-800 mb-4">
            While our directory covers most areas nationwide, we understand that some rural locations 
            may have limited local options. In these situations, we partner with Gentle Goodbye Equine 
            to ensure no one is left without professional assistance.
          </p>
          <p className="text-blue-800">
            Gentle Goodbye Equine offers nationwide coverage and can often arrange services even in 
            remote locations, ensuring that help is always available when you need it most.
          </p>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
          <p className="text-gray-700 mb-6">
            Have questions about our services or want to join our provider network?
          </p>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">For Providers</h3>
              <Link
                href="/submit"
                className="text-blue-600 hover:underline"
              >
                Submit your business for listing
              </Link>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Customer Support</h3>
              <p className="text-gray-600">
                Email: <a href="mailto:support@pasturepickup.com" className="text-blue-600 hover:underline">support@pasturepickup.com</a>
              </p>
              <p className="text-gray-600">
                Phone: <a href="tel:+1234567890" className="text-blue-600 hover:underline">(123) 456-7890</a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}