const { chromium } = require('playwright');

async function testMapMarkers() {
  console.log('🔍 Testing map markers specifically...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to homepage
    console.log('🏠 Navigating to homepage...');
    await page.goto('http://localhost:3001');
    
    // Wait for map to load and vendors to be fetched
    await page.waitForTimeout(8000);
    
    // Look for map container
    const mapContainer = await page.locator('.mapboxgl-map').first();
    console.log('🗺️ Map container found:', await mapContainer.count() > 0);
    
    // Look for any SVG elements (map layers) 
    const svgElements = await page.locator('svg').count();
    console.log('🎨 SVG elements found:', svgElements);
    
    // Look for circle elements (cluster points)
    const circles = await page.locator('circle').count();
    console.log('🔵 Circle elements found:', circles);
    
    // Look for canvas elements (Mapbox uses canvas)
    const canvases = await page.locator('canvas').count();
    console.log('🖼️ Canvas elements found:', canvases);
    
    // Check if any circles have the cluster colors
    const blueCircles = await page.locator('circle[fill="#11b4da"], circle[fill="#51bbd6"]').count();
    console.log('💙 Blue circles (vendor markers) found:', blueCircles);
    
    // Take a screenshot focused on the map area
    const mapElement = await page.locator('.mapboxgl-map').first();
    if (await mapElement.count() > 0) {
      await mapElement.screenshot({ path: 'map-area-only.png' });
      console.log('📸 Map area screenshot saved as map-area-only.png');
    }
    
    // Take full screenshot
    await page.screenshot({ path: 'full-page-test.png', fullPage: true });
    console.log('📸 Full page screenshot saved as full-page-test.png');
    
    console.log('✅ Marker test completed!');
    
  } catch (error) {
    console.error('❌ Marker test failed:', error);
  } finally {
    await browser.close();
  }
}

testMapMarkers().catch(console.error);