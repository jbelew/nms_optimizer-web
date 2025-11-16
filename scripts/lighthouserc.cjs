module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run preview',
      url: ['http://localhost:4173'],
      numberOfRuns: 3,
      serverReadyPattern: 'Local:',
      chromePath: '/usr/bin/chromium-browser',
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
