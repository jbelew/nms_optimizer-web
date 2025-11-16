module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run preview',
      url: ['http://localhost:4173'],
      numberOfRuns: 3,
      serverReadyPattern: 'http://localhost:4173',
      startServerReadyTimeout: 60000,
      chromePath: '/usr/bin/chromium-browser',
      chromeFlags: '--no-sandbox --disable-gpu --disable-dev-shm-usage --disable-software-rasterizer',
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'color-contrast': 'off',
        'csp-xss': 'off',
        'tap-targets': 'off',
        'uses-text-compression': 'off',
        'non-composited-animations': 'off',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
