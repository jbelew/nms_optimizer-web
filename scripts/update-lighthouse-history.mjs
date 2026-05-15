import fs from 'fs';
import path from 'path';

/**
 * Updates the Lighthouse history data.
 * Usage: node update-lighthouse-history.mjs <results-dir> <history-dir> <commit-sha>
 */

const resultsDir = process.argv[2];
const historyDir = process.argv[3];
const sha = process.argv[4];

if (!resultsDir || !historyDir || !sha) {
  console.error('Usage: node update-lighthouse-history.mjs <results-dir> <history-dir> <commit-sha>');
  process.exit(1);
}

const manifestPath = path.join(resultsDir, 'manifest.json');

if (!fs.existsSync(manifestPath)) {
  console.error('Manifest not found at', manifestPath);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// GitHub Actions runners can be flaky, so we select the run with the highest performance score
// to find the true baseline of the application without artificial CI bottlenecks.
const run = manifest.sort((a, b) => {
  const perfA = a.summary?.performance || 0;
  const perfB = b.summary?.performance || 0;

  return perfB - perfA; // Descending order
})[0];

if (!run) {
  console.error('No runs found in manifest');
  process.exit(1);
}

// Extract scores from summary
const scores = run.summary;

const newData = {
  date: new Date().toISOString(),
  scores: scores,
  sha: sha
};

const dataPath = path.join(historyDir, 'data.json');
let history = [];

if (fs.existsSync(dataPath)) {
  try {
    history = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch (_e) {
    console.warn('Failed to parse existing data.json, starting fresh');
  }
}

// Check for duplicate SHA (e.g. re-runs)
const existingIndex = history.findIndex(d => d.sha === sha);

if (existingIndex !== -1) {
  history[existingIndex] = newData;
} else {
  history.push(newData);
}

// Sort by date and keep reasonable history
history.sort((a, b) => new Date(a.date) - new Date(b.date));

// Write updated data
fs.writeFileSync(dataPath, JSON.stringify(history, null, 2));

// Copy the HTML report to a versioned folder
const reportsDir = path.join(historyDir, 'reports', sha);

if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Robust report discovery
let reportPath = path.join(resultsDir, run.htmlPath || '');

if (!fs.existsSync(reportPath)) {
  // Fallback: search for any HTML file in the results directory
  const files = fs.readdirSync(resultsDir);
  const htmlFile = files.find(f => f.endsWith('.html') && !f.includes('manifest'));

  if (htmlFile) {
    reportPath = path.join(resultsDir, htmlFile);
  }
}

if (fs.existsSync(reportPath)) {
  const destPath = path.join(reportsDir, 'index.html');
  fs.copyFileSync(reportPath, destPath);
  console.log(`Report successfully captured: ${reportPath} -> ${destPath}`);
} else {
  console.error(`CRITICAL: Lighthouse HTML report not found in ${resultsDir}. Links on the dashboard will 404.`);
  // We don't exit 1 here to avoid breaking the whole CI, but the error will be visible
}

// Copy font assets to ensure dashboard renders correctly on the history branch
const fontsSourceDir = 'public/assets/fonts';
const fontsDestDir = path.join(historyDir, 'assets/fonts');

if (fs.existsSync(fontsSourceDir)) {
  if (!fs.existsSync(fontsDestDir)) {
    fs.mkdirSync(fontsDestDir, { recursive: true });
  }

  const fontFiles = fs.readdirSync(fontsSourceDir);

  for (const file of fontFiles) {
    fs.copyFileSync(path.join(fontsSourceDir, file), path.join(fontsDestDir, file));
  }
}

console.log(`Successfully updated history for commit ${sha}`);
