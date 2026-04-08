module.exports = {
  ci: {
    collect: {
      url: ['http://127.0.0.1:4173/'],
      startServerCommand: 'npm run preview -- --host 127.0.0.1',
      // Store report data in a temporary system directory to keep the repo clean
      baseDir: '/tmp/lighthouse',
      settings: {
        formFactor: 'mobile',
        throttlingMethod: 'devtools',
        chromeFlags: '--headless --no-sandbox --disable-gpu --user-data-dir=/tmp/lighthouse-chrome',
        throttling: {
          cpuSlowdownMultiplier: 1.5,
          downloadThroughputKbps: 10240, // 10 Mbps
          uploadThroughputKbps: 5120, // 5 Mbps
          requestLatencyMs: 40,
        },
        screenEmulation: {
          mobile: true,
          width: 393,
          height: 852,
          deviceScaleFactor: 3,
          disabled: false,
        },
        emulatedUserAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
      }
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
