const { chromium } = require('playwright');

async function testCircleColors() {
  console.log('🔍 Testing circle colors and styles...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to homepage
    await page.goto('http://localhost:3001');
    await page.waitForTimeout(8000);
    
    // Get all circle elements and their properties
    const circleInfo = await page.evaluate(() => {
      const circles = document.querySelectorAll('circle');
      return Array.from(circles).map((circle, index) => ({
        index,
        fill: circle.getAttribute('fill'),
        stroke: circle.getAttribute('stroke'),
        r: circle.getAttribute('r'),
        cx: circle.getAttribute('cx'),
        cy: circle.getAttribute('cy'),
        style: circle.style.cssText,
        className: circle.className.baseVal || circle.className
      }));
    });
    
    console.log('🔵 Found circles:', JSON.stringify(circleInfo, null, 2));
    
    // Check for any elements with the cluster layer IDs
    const clusterElements = await page.evaluate(() => {
      const layers = ['clusters', 'cluster-count', 'unclustered-point'];
      return layers.map(layerId => {
        const elements = document.querySelectorAll(`[data-layer="${layerId}"], .${layerId}, #${layerId}`);
        return {
          layerId,
          count: elements.length,
          elements: Array.from(elements).map(el => ({
            tagName: el.tagName,
            className: el.className,
            style: el.style.cssText
          }))
        };
      });
    });
    
    console.log('🗺️ Cluster layer elements:', JSON.stringify(clusterElements, null, 2));
    
    // Check the map source data
    const mapSourceData = await page.evaluate(() => {
      const mapInstance = window.mapboxgl && window.mapboxgl.getMap && window.mapboxgl.getMap();
      if (mapInstance) {
        const source = mapInstance.getSource('vendors');
        return source ? source._data : null;
      }
      return null;
    });
    
    console.log('📊 Map source data:', mapSourceData);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testCircleColors().catch(console.error);