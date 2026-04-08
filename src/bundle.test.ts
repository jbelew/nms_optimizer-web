import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Bundle Size Constraints', () => {
  it('vendor-events chunk should be under 240KB', () => {
    const assetsDir = path.resolve(__dirname, '../dist/assets');
    
    // Check if dist/assets exists (requires a build first)
    if (!fs.existsSync(assetsDir)) {
      throw new Error('dist/assets does not exist. Run "npm run build" first.');
    }

    const files = fs.readdirSync(assetsDir);
    const vendorEventsFile = files.find(f => f.startsWith('vendor-events-') && f.endsWith('.js'));

    if (!vendorEventsFile) {
      throw new Error('vendor-events chunk not found in dist/assets');
    }

    const filePath = path.join(assetsDir, vendorEventsFile);
    const stats = fs.statSync(filePath);
    const sizeInKB = stats.size / 1024;

    console.log(`Current vendor-events chunk size: ${sizeInKB.toFixed(2)} KB`);

    // We set the threshold to 240KB to ensure this fails initially (TDD Red Phase)
    // as the current baseline is ~251KB.
    expect(sizeInKB).toBeLessThan(240);
  });
});
