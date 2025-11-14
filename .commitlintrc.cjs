module.exports = {
  ai: {
    provider: 'gemini',
    gemini: {
      model: 'gemini-2.5-flash',
      apiKey: process.env.GEMINI_API_KEY, // It's best practice to use environment variables for API keys
    },
  },
};