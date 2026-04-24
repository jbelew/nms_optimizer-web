import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Throttle CPU to simulate a slower device (e.g., mobile)
  const client = await page.context().newCDPSession(page);
  await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  
  // Connect to the existing preview server
  await page.goto('http://127.0.0.1:4173/?platform=standard');
  
  // Wait for the app to be ready
  await page.waitForSelector('[role="gridcell"]');
  
  // Setup PerformanceObserver to capture INP
  await page.evaluate(() => {
    window.__INP_ENTRIES = [];
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.interactionId) {
          window.__INP_ENTRIES.push({
            name: entry.name,
            duration: entry.duration,
            interactionId: entry.interactionId,
            startTime: entry.startTime
          });
        }
      }
    }).observe({ type: 'event', durationThreshold: 0, buffered: true });
  });

  console.log('Starting interactions...');

  // Perform interactions
  // 1. Click some grid cells
  const gridCells = page.locator('[role="gridcell"]');

  for (let i = 0; i < 5; i++) {
    await gridCells.nth(i).click();
    await new Promise(r => setTimeout(r, 200));
  }

  // 2. Click "Solve" for Starship Shields
  await page.click('button[aria-label*="Solve Starship Shields"]');
  
  // Wait for optimization to finish (approx)
  await page.waitForTimeout(5000);

  // 3. Click "Reset Grid"
  await page.click('button:has-text("Reset Grid")');
  await new Promise(r => setTimeout(r, 500));

  const { inpEntries, measures } = await page.evaluate(() => ({
    inpEntries: window.__INP_ENTRIES,
    measures: performance.getEntriesByType('measure').map(m => ({ name: m.name, duration: m.duration }))
  }));
  console.log('INP Entries:', JSON.stringify(inpEntries, null, 2));
  console.log('Performance Measures:', JSON.stringify(measures, null, 2));

  const sortedDurations = inpEntries.map(e => e.duration).sort((a, b) => a - b);
  const p90 = sortedDurations[Math.floor(sortedDurations.length * 0.9)] || 0;
  const maxDuration = Math.max(...sortedDurations, 0);
  
  console.log(`Max INP Duration: ${maxDuration}ms`);
  console.log(`P90 INP Duration: ${p90}ms`);

  await browser.close();
})();
