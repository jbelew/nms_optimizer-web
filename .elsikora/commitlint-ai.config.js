export default {
  maxRetries: 3,
  mode: 'auto',
  model: 'gemini-2.5-flash',
  provider: 'google',
  ticket: {
    missingBranchLintBehavior: 'fallback',
    normalization: 'preserve',
    pattern: '[a-z]{2,}-[0-9]+',
    patternFlags: 'i',
    source: 'auto'
  },
  validationMaxRetries: 3
};