// Service Worker — Côte à Côte Push Notifications
// Fichier : public/sw.js

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()))

self.addEventListener('push', event => {
  const data = event.data?.json() || {}
  const { title = 'Côte à Côte', body = '', icon = '/icon-192.png', url = '/' } = data

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge: '/badge-72.png',
      vibrate: [200, 100, 200],
      data: { url },
      actions: [
        { action: 'open', title: 'Voir' },
        { action: 'close', title: 'Fermer' },
      ],
    })
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  if (event.action === 'close') return

  const url = event.notification.data?.url || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      const existing = clients.find(c => c.url.includes(self.location.origin))
      if (existing) { existing.focus(); existing.navigate(url) }
      else self.clients.openWindow(url)
    })
  )
})
