module.exports = {
  ci: {
    // Store all LHCI state and reports in /tmp to avoid Windows partition / symlink issues
    baseDir: '/tmp/lighthouse-ci',
    collect: {
      // Use the Linux Chrome binary, NOT the Windows one (which LHCI might default to in WSL)
      chromePath: '/usr/bin/google-chrome',
      settings: {
        chromeFlags: '--headless --no-sandbox --disable-gpu --user-data-dir=/tmp/lighthouse-chrome',
        emulatedUserAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
        formFactor: 'mobile',
        screenEmulation: {
          deviceScaleFactor: 3,
          disabled: false,
          height: 852,
          mobile: true,
          width: 393,
        },
        throttling: {
          cpuSlowdownMultiplier: 1.5,
          downloadThroughputKbps: 10240, // 10 Mbps
          requestLatencyMs: 40,
          uploadThroughputKbps: 5120, // 5 Mbps
        },
        throttlingMethod: 'devtools',
      },
      startServerCommand: 'bun run preview -- --host 127.0.0.1',
      startServerReadyPattern: 'listen|ready|http://127.0.0.1',
      startServerReadyTimeout: 60000,
      url: ['http://127.0.0.1:4173/']
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};

