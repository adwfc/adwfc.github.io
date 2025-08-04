self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => console.log('Service Worker aktiviert'));

self.addEventListener('message', (event) => {
  if (event.data === 'note-update') {
    self.registration.showNotification('Notiz aktualisiert ✏️', {
      body: 'Notiz aktualisiert.',
      icon: 'm/rakete.png'
    });
  }
});
