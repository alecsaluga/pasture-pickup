const { chromium } = require('playwright');

async function debugMapInstance() {
  console.log('🔧 Debugging map instance access...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  try {
    const page = await browser.newPage();
    
    // Listen for console messages to see map setup
    page.on('console', msg => {
      if (msg.text().includes('🔧') || msg.text().includes('🗺️') || msg.text().includes('✅')) {
        console.log(`📱 ${msg.text()}`);
      }
    });
    
    await page.goto('http://localhost:3001');
    await page.waitForTimeout(10000); // Wait longer for map to fully load
    
    // Check if map instance exists in various ways
    const mapDebugInfo = await page.evaluate(() => {
      // Check global variables
      const hasMapboxgl = typeof mapboxgl !== 'undefined';
      const hasWindow = typeof window !== 'undefined';
      
      // Try to find map container
      const mapContainer = document.querySelector('.mapboxgl-map');
      const hasMapContainer = mapContainer !== null;
      
      // Check for any Mapbox-related DOM elements
      const mapboxElements = document.querySelectorAll('[class*="mapbox"]');
      const mapboxElementCount = mapboxElements.length;
      
      // Try to access map through React refs (if available)
      let reactMapInfo = null;
      try {
        const mapDiv = document.querySelector('[ref="mapRef"], .mapboxgl-map');
        if (mapDiv && mapDiv._reactInternalInstance) {
          reactMapInfo = 'React instance found';
        }
      } catch (e) {
        reactMapInfo = 'React access failed: ' + e.message;
      }
      
      // Check for canvas elements (Mapbox uses canvas for rendering)
      const canvasElements = document.querySelectorAll('canvas');
      const canvasInfo = Array.from(canvasElements).map((canvas, i) => ({
        index: i,
        width: canvas.width,
        height: canvas.height,
        className: canvas.className,
        style: canvas.style.cssText
      }));
      
      return {
        hasMapboxgl,
        hasWindow,
        hasMapContainer,
        mapboxElementCount,
        reactMapInfo,
        canvasInfo,
        mapContainerStyle: mapContainer ? mapContainer.style.cssText : null,
        mapContainerChildren: mapContainer ? mapContainer.children.length : 0
      };
    });
    
    console.log('🔍 Map debug info:', JSON.stringify(mapDebugInfo, null, 2));
    
    // Try to access the actual map layers through Mapbox API
    const layerInfo = await page.evaluate(() => {
      try {
        const mapContainer = document.querySelector('.mapboxgl-map');
        if (!mapContainer) return { error: 'No map container found' };
        
        // Mapbox stores map instance in the container
        const mapInstance = mapContainer._map || mapContainer.map;
        if (!mapInstance) return { error: 'No map instance found' };
        
        const style = mapInstance.getStyle();
        const sources = style ? style.sources : {};
        const layers = style ? style.layers : [];
        
        return {
          sourcesCount: Object.keys(sources).length,
          layersCount: layers.length,
          hasVendorsSource: 'vendors' in sources,
          vendorsSourceData: sources.vendors,
          clusterLayers: layers.filter(l => l.id && (l.id.includes('cluster') || l.id.includes('vendors')))
        };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log('🗺️ Layer info:', JSON.stringify(layerInfo, null, 2));
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await browser.close();
  }
}

debugMapInstance().catch(console.error);