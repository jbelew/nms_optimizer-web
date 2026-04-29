/**
 * @file Verification script for Cloudflare deployment
 * 
 * This script runs against the LIVE production site (or a preview URL)
 * to verify that the caching strategy is correctly implemented.
 * 
 * Usage: node scripts/verify-deployment.mjs [url]
 */

import { execSync } from 'child_process';

const TARGET = process.argv[2] || 'https://nms-optimizer.app';
const LOCALES = ['en', 'es', 'fr', 'de', 'pt'];

function getHeaders(path) {
    const url = `${TARGET}${path}`;

    try {
        const output = execSync(`curl -I -s "${url}"`, { encoding: 'utf-8' });
        const headers = {};
        output.split('\n').forEach(line => {
            const [key, ...values] = line.split(':');

            if (key && values.length) {
                const headerKey = key.trim().toLowerCase();
                const headerValue = values.join(':').trim();

                if (headers[headerKey]) {
                    headers[headerKey] += `, ${headerValue}`;
                } else {
                    headers[headerKey] = headerValue;
                }
            }
        });

        return headers;
    } catch (_e) {
        console.error(`Failed to fetch headers for ${url}`);

        return null;
    }
}

async function verify() {
    console.log(`\n🚀 Verifying deployment at ${TARGET}\n`);

    let errors = 0;

    // 1. Check for duplicate Cache-Control headers on translations
    console.log('--- 1. Header Overlap Check ---');
    const translationHeaders = getHeaders('/assets/locales/en/translation.json');

    if (translationHeaders) {
        const cc = translationHeaders['cache-control'];
        const matches = cc.match(/public/g) || [];

        if (matches.length > 1) {
            console.log('✗ /assets/locales/en/translation.json - DUPLICATE CACHE-CONTROL HEADERS FOUND');
            console.log(`  Value: ${cc}`);
            errors++;
        } else {
            console.log('✓ /assets/locales/en/translation.json - Clean Cache-Control');
        }
    }

    // 2. Check SSG Cache Status (Should be HIT, not DYNAMIC)
    console.log('\n--- 2. SSG Cache Status (Pages Function Bypass) ---');

    for (const lang of LOCALES) {
        const path = lang === 'en' ? '/about/' : `/${lang}/about/`;
        // Fetch twice to ensure HIT
        getHeaders(path);
        const headers = getHeaders(path);
        const status = headers['cf-cache-status'];

        if (status === 'DYNAMIC') {
            console.log(`✗ ${path} - Status is DYNAMIC (Still hitting Pages Function)`);
            errors++;
        } else if (status === 'HIT' || status === 'REVALIDATED' || status === 'MISS' || status === 'STALE') {
             console.log(`✓ ${path} - Status: ${status}`);
        } else {
             console.log(`? ${path} - Status: ${status}`);
        }
    }

    // 3. Check SPA Fallback
    console.log('\n--- 3. SPA Fallback Check ---');
    const spaPath = '/es/performance/';
    const spaHeaders = getHeaders(spaPath);

    if (spaHeaders['x-spa-fallback'] === 'true') {
        console.log(`✓ ${spaPath} - X-SPA-Fallback: true`);
    } else {
        console.log(`✗ ${spaPath} - X-SPA-Fallback header missing`);
        errors++;
    }

    // 4. Check Hashed Asset Immutability
    console.log('\n--- 4. Build Asset Immutability ---');
    const html = execSync(`curl -s "${TARGET}/"`, { encoding: 'utf-8' });
    const assetMatch = html.match(/\/build\/[^"]+\.js/);

    if (assetMatch) {
        const assetPath = assetMatch[0];
        const headers = getHeaders(assetPath);
        const cc = headers['cache-control'] || '';

        if (cc.includes('immutable') && cc.includes('max-age=31536000')) {
            console.log(`✓ ${assetPath} - Cache-Control: immutable, max-age=31536000`);
        } else {
            console.log(`✗ ${assetPath} - MISSING IMMUTABLE HEADERS`);
            console.log(`  Value: ${cc}`);
            errors++;
        }
        
        // Check Cloudflare Status (Should be HIT on 2nd request)
        getHeaders(assetPath);
        const headers2 = getHeaders(assetPath);

        if (headers2['cf-cache-status'] === 'HIT') {
             console.log(`✓ ${assetPath} - cf-cache-status: HIT`);
        } else {
             console.log(`✗ ${assetPath} - cf-cache-status: ${headers2['cf-cache-status']} (Expected HIT)`);
             errors++;
        }
    }

    console.log('\n' + '='.repeat(40));

    if (errors === 0) {
        console.log('\n✅ ALL DEPLOYMENT CHECKS PASSED');
    } else {
        console.log(`\n❌ ${errors} CHECKS FAILED`);
        process.exit(1);
    }
}

verify();
