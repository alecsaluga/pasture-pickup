# Pasture Pickup - Livestock Removal Vendor Directory

A comprehensive Next.js application connecting property owners with professional livestock removal services nationwide. Features interactive maps, advanced search, vendor management, and programmatic SEO for 500+ location pages.

## 🚀 Features

### Core Functionality
- **Interactive Map Search**: Mapbox GL JS integration with vendor clustering and location search
- **Google Places Integration**: Auto-complete location search with geocoding
- **Vendor Directory**: Comprehensive listings with detailed provider information
- **Public Submission System**: Easy vendor onboarding with admin approval workflow
- **Admin Dashboard**: Complete vendor management and submission review system

### SEO & Performance
- **500+ Programmatic SEO Pages**: State, city, and service-specific landing pages
- **Schema Markup**: Comprehensive LocalBusiness and Service structured data
- **Dynamic Sitemap**: Auto-generated XML sitemap for all pages
- **Optimized Meta Tags**: Dynamic meta tags and Open Graph optimization
- **Google Analytics 4**: Conversion tracking and user behavior analytics

### Technical Stack
- **Framework**: Next.js 14 with App Router and TypeScript
- **Styling**: Tailwind CSS with responsive design
- **Database**: Airtable REST API integration
- **Maps**: Mapbox GL JS with clustering and interactive features
- **Location Services**: Google Places API and Geocoding API
- **Deployment**: Vercel optimized configuration
- **Forms**: React Hook Form with validation

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Airtable account and API key
- Google Cloud Platform account (for Maps/Places APIs)
- Mapbox account and access token
- Vercel account (for deployment)

### Environment Variables
Create `.env.local` file with the following variables:

```bash
# Airtable Configuration
AIRTABLE_API_KEY=your_airtable_api_key_here
AIRTABLE_BASE_ID=your_airtable_base_id_here

# Google APIs
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Mapbox
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Airtable Database**
   
   Create two tables in your Airtable base:

   **Vendors Table:**
   - Name (Single line text)
   - Phone (Single line text)
   - Email (Email)
   - Website (URL)
   - Address (Single line text)
   - City (Single line text)
   - State (Single line text)
   - StateCode (Single line text)
   - Latitude (Number)
   - Longitude (Number)
   - ServiceTypes (Long text)
   - Species (Long text)
   - ServiceRadius (Number)
   - Description (Long text)
   - Status (Single select: Active, Pending, Inactive)
   - EmergencyService (Checkbox)
   - InsuranceCertified (Checkbox)
   - BusinessHours (Single line text)
   - FeaturedImage (Attachment)
   - CreatedAt (Created time)
   - UpdatedAt (Last modified time)

   **Vendor Submissions Table:**
   - BusinessName (Single line text)
   - ContactName (Single line text)
   - Phone (Single line text)
   - Email (Email)
   - Address (Single line text)
   - Services (Long text)
   - Description (Long text)
   - Website (URL)
   - ServiceRadius (Number)
   - EmergencyService (Checkbox)
   - SubmissionStatus (Single select: Pending, Approved, Rejected)
   - SubmittedAt (Created time)
   - SubmitterIP (Single line text)

3. **Configure APIs**
   - Enable Google Places API and Geocoding API
   - Create Mapbox account and get access token
   - Set up Google Analytics 4 property

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Deployment to Vercel

1. **Deploy**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Deploy
   vercel --prod
   ```

2. **Configure Environment Variables in Vercel**
   - Add all environment variables to Vercel project settings
   - Update NEXT_PUBLIC_APP_URL to production URL

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── [state]/           # Dynamic state pages (50 pages)
│   │   ├── [city]/        # Dynamic city pages (200+ pages)
│   │   │   └── [service]/ # Dynamic service pages (1000+ pages)
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard
│   ├── submit/            # Vendor submission
│   └── vendor/[id]/       # Individual vendor pages
├── components/            # Reusable React components
├── lib/                   # Utility functions and API integrations
└── types/                 # TypeScript type definitions
```

## 🎯 SEO Strategy

### Programmatic Pages (500+ URLs)
- **State Level**: `/pennsylvania` (50 pages)
- **State + Service**: `/pennsylvania/dead-horse-removal` (300 pages)  
- **City Level**: `/pennsylvania/pittsburgh` (200+ pages)
- **City + Service**: `/pennsylvania/pittsburgh/dead-horse-removal` (1000+ pages)

### Key Features
- Dynamic meta tags and schema markup
- Location-specific content and FAQs
- Comprehensive internal linking
- XML sitemap generation
- Google Analytics conversion tracking

## 🔧 Admin Features

- **Vendor Management**: View, edit, approve/reject vendors
- **Submission Review**: Process new vendor applications
- **Analytics Dashboard**: Track performance metrics
- **CSV Export**: Download vendor data
- **Status Management**: Update vendor status and visibility

## 📊 Key Metrics Tracked

- Vendor contact conversions (phone, website, directions)
- Location search usage and selections
- Vendor submission rate and approval workflow
- Geographic performance by state/city
- Emergency vs. standard service requests

## 🛡️ Security & Performance

- Environment variable protection
- Input validation and sanitization
- API response caching
- Image optimization
- Mobile-responsive design
- Core Web Vitals optimization

---

**Built for the livestock and agricultural community** 🐄🐎
