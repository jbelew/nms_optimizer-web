export default {
  maxRetries: 3,
  mode: 'auto',
  model: 'gemini-2.5-flash',
  provider: 'google',
  validationMaxRetries: 3,
  ticket: {
    missingBranchLintBehavior: 'fallback',
    normalization: 'preserve',
    pattern: '[a-z]{2,}-[0-9]+',
    patternFlags: 'i',
    source: 'auto'
  }
};