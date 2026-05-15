module.exports = {
  ci: {
    // Store all LHCI state and reports in /tmp to avoid Windows partition / symlink issues
    baseDir: '/tmp/lighthouse-ci',
    collect: {
      url: ['http://127.0.0.1:4173/'],
      // Use the Linux Chrome binary, NOT the Windows one (which LHCI might default to in WSL)
      chromePath: '/usr/bin/google-chrome',
      startServerCommand: 'bun run preview -- --host 127.0.0.1',
      startServerReadyPattern: 'listen|ready|http://127.0.0.1',
      startServerReadyTimeout: 60000,
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

