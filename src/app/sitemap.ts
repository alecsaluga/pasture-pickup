import { MetadataRoute } from 'next';
import { generateSEOPaths, US_STATES, LIVESTOCK_SERVICES } from '@/lib/locations';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pasturepickup.com';
  
  const routes: MetadataRoute.Sitemap = [
    // Core pages
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/map`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/submit`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Add all programmatic SEO pages
  const seoPaths = generateSEOPaths();
  
  seoPaths.forEach(path => {
    // Determine priority based on page type
    let priority = 0.5;
    let changeFrequency: 'yearly' | 'monthly' | 'weekly' = 'monthly';
    
    const pathParts = path.split('/').filter(Boolean);
    
    if (pathParts.length === 1) {
      // State-level pages
      priority = 0.8;
      changeFrequency = 'weekly';
    } else if (pathParts.length === 2) {
      if (LIVESTOCK_SERVICES.includes(pathParts[1])) {
        // State + service pages
        priority = 0.7;
      } else {
        // City pages
        priority = 0.6;
      }
    } else if (pathParts.length === 3) {
      // City + service pages (highest SEO value)
      priority = 0.9;
      changeFrequency = 'weekly';
    }
    
    routes.push({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
    });
  });

  return routes;
}