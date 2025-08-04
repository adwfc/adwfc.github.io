self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => console.log('SW aktiv'));

self.addEventListener('message', (event) => {
  if (event.data === 'note-update') {
    self.registration.showNotification('Notiz aktualisiert', {
      body: 'Jemand hat eine Notiz bearbeitet.',
      icon: 'm/rakete.png'
    });
  }
});
