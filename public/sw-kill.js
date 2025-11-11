self.addEventListener('install', function(event) {
  self.skipWaiting(); // Force the new service worker to activate immediately
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          return caches.delete(cacheName); // Clear all caches
        })
      );
    }).then(function() {
      return self.registration.unregister(); // Unregister the service worker itself
    }).then(function() {
      console.log('Service worker unregistered and caches cleared.');
      // Optionally, send a message to the client to reload
      self.clients.matchAll().then(function(clients) {
        clients.forEach(client => client.postMessage('SW_UNREGISTERED'));
      });
    })
  );
});
