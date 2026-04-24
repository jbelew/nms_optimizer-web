import fs from 'fs';

const tracePath = 'solve_interaction_trace.json';

if (!fs.existsSync(tracePath)) {
  console.error(`Trace file not found: ${tracePath}`);
  process.exit(1);
}

const trace = JSON.parse(fs.readFileSync(tracePath, 'utf8'));
const events = trace.traceEvents || trace;

const mainThreadEvents = events.filter(e => 
  e.ph === 'X' && // Complete events
  e.dur > 50000 && // Longer than 50ms (in microseconds)
  (e.name === 'RunTask' || e.name === 'FunctionCall' || e.name === 'EvaluateScript' || e.name === 'v8.run' || e.name === 'MajorGC')
);

console.log(`Found ${mainThreadEvents.length} tasks > 50ms`);

mainThreadEvents.sort((a, b) => b.dur - a.dur).slice(0, 10).forEach(e => {
  console.log(`- ${e.name}: ${(e.dur / 1000).toFixed(2)}ms at ${(e.ts / 1000).toFixed(2)}ms`);

  if (e.args && e.args.data) {
     console.log(`  Data: ${JSON.stringify(e.args.data)}`);
  }
});

// Look for 'UpdateLayoutTree', 'Layout', 'Paint'
const renderingEvents = events.filter(e => 
    ['UpdateLayoutTree', 'Layout', 'Paint', 'CompositeLayers'].includes(e.name) &&
    e.dur > 10000
);

if (renderingEvents.length > 0) {
    console.log(`\nRendering tasks > 10ms: ${renderingEvents.length}`);
    renderingEvents.sort((a, b) => b.dur - a.dur).slice(0, 5).forEach(e => {
        console.log(`- ${e.name}: ${(e.dur / 1000).toFixed(2)}ms`);
    });
}
