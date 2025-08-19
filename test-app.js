const { chromium } = require('playwright');

async function testPasturePickup() {
  console.log('🚀 Starting Pasture Pickup test...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down actions to see what's happening
  });
  
  try {
    const page = await browser.newPage();
    
    // Listen for console messages
    page.on('console', msg => {
      console.log(`📱 Console ${msg.type()}: ${msg.text()}`);
    });
    
    // Listen for errors
    page.on('pageerror', error => {
      console.error(`❌ Page error: ${error.message}`);
    });
    
    // Navigate to the homepage
    console.log('🏠 Navigating to homepage...');
    await page.goto('http://localhost:3001');
    
    // Wait for the page to load
    await page.waitForTimeout(3000);
    
    // Take a screenshot
    console.log('📸 Taking homepage screenshot...');
    await page.screenshot({ path: 'homepage-test.png', fullPage: true });
    
    // Check if the map container exists
    const mapContainer = await page.locator('.mapboxgl-map').count();
    console.log(`🗺️ Map containers found: ${mapContainer}`);
    
    // Check if vendors API is loading
    console.log('🔄 Testing vendors API...');
    const vendorsResponse = await page.evaluate(async () => {
      const response = await fetch('/api/vendors');
      const data = await response.json();
      return data;
    });
    console.log(`👥 Vendors loaded: ${vendorsResponse.length}`);
    
    // Test the search functionality
    console.log('🔍 Testing search functionality...');
    const searchInput = page.locator('input[placeholder*="Enter your city"]');
    await searchInput.click();
    await searchInput.type('San Francisco, CA');
    
    // Wait for potential autocomplete
    await page.waitForTimeout(2000);
    
    // Check if Google Places autocomplete appears
    const autocompleteDropdown = await page.locator('.pac-container, [class*="autocomplete"], [class*="suggestion"]').count();
    console.log(`🎯 Autocomplete suggestions found: ${autocompleteDropdown}`);
    
    // Take final screenshot
    console.log('📸 Taking final screenshot...');
    await page.screenshot({ path: 'homepage-final.png', fullPage: true });
    
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testPasturePickup().catch(console.error);