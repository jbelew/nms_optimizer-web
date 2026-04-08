module.exports = {
  ci: {
    collect: {
      url: ['http://127.0.0.1:4173/'],
      startServerCommand: 'npm run preview -- --host 127.0.0.1',
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
