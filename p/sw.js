self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  console.log('Service Worker aktiviert');
});

self.addEventListener('message', (event) => {
  if (event.data === 'show-notification') {
    self.registration.showNotification('Push-Test', {
      body: 'Benachrichtigung vom Service Worker (' + new Date().toLocaleTimeString() + ')',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/OOjs_UI_icon_notice.svg'
    });
  }
});
