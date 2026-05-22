/**
 * @file Consistency check for Cloudflare Pages routing configuration.
 * 
 * Ensures that every pre-rendered SSG page in the `dist/` directory
 * is explicitly excluded from the Cloudflare Pages Function in `_routes.json`.
 * This guarantees that static content bypasses the Function and hits the CDN directly.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, '../dist');
const ROUTES_JSON = path.join(__dirname, '../public/_routes.json');

function getAllHtmlFiles(dir, base = '') {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat && stat.isDirectory()) {
            results = results.concat(getAllHtmlFiles(filePath, path.join(base, file)));
        } else if (file === 'index.html') {
            // We only care about index.html files (pretty URLs)
            results.push('/' + base + '/');
        }
    });

    return results;
}

function verify() {
    if (!fs.existsSync(DIST)) {
        console.warn('⚠️ dist directory not found. Run bun run build first.');
        process.exit(0);
    }

    const routes = JSON.parse(fs.readFileSync(ROUTES_JSON, 'utf-8'));
    const excluded = new Set(routes.exclude || []);
    
    const ssgPaths = getAllHtmlFiles(DIST).map(p => p.replace(/\/+/g, '/'));
    
    console.log('\n🔍 Verifying _routes.json exclusion consistency...\n');
    
    let errors = 0;
    ssgPaths.forEach(p => {
        // Skip the root and language roots as they are handled by /index.html and /lang/index.html
        if (p === '/') return;
        if (p.match(/^\/(es|fr|de|pt|it)\/$/)) return;

        if (!excluded.has(p)) {
            console.log(`✗ ${p} is missing from public/_routes.json exclude list`);
            errors++;
        }
    });

    if (errors === 0) {
        console.log('✅ ALL SSG paths are correctly excluded from the Pages Function.');
    } else {
        console.log(`\n❌ ${errors} SSG paths are NOT excluded. They will be slower (DYNAMIC status).`);
        console.log('Add them to the "exclude" array in public/_routes.json.');
        process.exit(1);
    }
}

verify();
