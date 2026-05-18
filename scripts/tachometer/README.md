# Tachometer benchmarks

Statistically-rigorous browser benchmarks for catching real performance
regressions. Replaces ad-hoc Lighthouse runs where noise drowns out signal.

## What it measures

[`fcp.json`](./fcp.json) compares **First Contentful Paint** between:

- `production` — the live site at `https://nms-optimizer.app/`
- `local` — the freshly-built `dist/` served via [`scripts/serve-ssg.mjs`](../serve-ssg.mjs) on `127.0.0.1:8888`

Tachometer launches headless Chrome 50+ times per benchmark and uses
confidence-interval analysis to determine whether the difference is
statistically significant. A single number is almost never meaningful —
the report shows `[lower, upper] 95% CI`.

## Quick start

```bash
# Build, serve, and benchmark in one step
bun run bench:build

# Or, if dist/ is already up to date
bun run bench
```

The wrapper script ([`scripts/run-bench.mjs`](../run-bench.mjs)) boots the
SSG preview server, waits for the port, runs tachometer, and tears down
the server on exit — even if you Ctrl-C.

## Reading the output

Sample (truncated) result:

```
┌─────────────┬───────────┬─────────────────────────────────┐
│ Benchmark   │  Avg FCP  │ vs production                   │
├─────────────┼───────────┼─────────────────────────────────┤
│ production  │  412.3 ms │                                 │
│ local       │  398.7 ms │ faster: 13.6 ms (3.30%)         │
│             │           │ 95% CI: [-5.2 ms, +32.4 ms]     │
└─────────────┴───────────┴─────────────────────────────────┘
```

**Interpretation rules:**

- If the 95% CI **crosses zero**, the difference is **not statistically
  significant**. Treat as no change.
- If the CI is entirely on one side, the regression/improvement is real
  at the 95% confidence level.
- Run multiple times before drawing conclusions — even tachometer's
  stats can't fully eliminate machine variance.

## When to run

This is a manual tool, not part of CI. Run it when:

- You suspect a change might regress initial load (e.g., touching the
  entry chunk, removing lazy boundaries, swapping a dependency).
- Before pushing a notable refactor.
- When investigating a real user complaint about load time.

CI runners (GitHub Actions) have noisy CPU and would produce
inconsistent results — that's the same reason Lighthouse-CI is
unreliable. Run tachometer on your local machine, with other
applications quiet, for trustworthy numbers.

## Customizing

Edit [`fcp.json`](./fcp.json) to:

- Change the production URL (currently `https://nms-optimizer.app/`).
- Add more benchmarks (e.g., `/about/`, `/instructions/`).
- Add CPU throttling: `"cpuThrottlingRate": 4` inside the `browser` block.
- Change measurement: `"measurement": "fcp"` → `"lcp"` or a custom
  `performanceEntry` name.

Full schema: [`node_modules/tachometer/config.schema.json`](../../node_modules/tachometer/config.schema.json).

For custom CLI flags (sample size, timeout, etc.):

```bash
bun scripts/run-bench.mjs scripts/tachometer/fcp.json
# Or bypass the wrapper and call tachometer directly once the server is up
bunx tachometer --config scripts/tachometer/fcp.json --sample-size 100
```
