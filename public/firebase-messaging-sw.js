// ─────────────────────────────────────────────────────────────────────────────
// public/firebase-messaging-sw.js
// Firebase Cloud Messaging Service Worker
// Handles background push notifications in the browser
// ─────────────────────────────────────────────────────────────────────────────

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Must match your firebaseConfig in firebase.js
// These values are safe to expose in the service worker
firebase.initializeApp({
  apiKey:            self.FIREBASE_API_KEY            || "YOUR_API_KEY",
  authDomain:        "ms-hospital-diversion.firebaseapp.com",
  projectId:         "ms-hospital-diversion",
  storageBucket:     "ms-hospital-diversion.appspot.com",
  messagingSenderId: self.FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId:             self.FIREBASE_APP_ID              || "YOUR_APP_ID",
});

const messaging = firebase.messaging();

// Handle background messages (when app is minimized or closed)
messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification;
  const data = payload.data || {};

  const notificationOptions = {
    body,
    icon:   '/logo192.png',
    badge:  '/badge.png',
    tag:    `diversion-${data.hospitalId}`,   // replaces older notification for same hospital
    renotify: true,
    data:   { url: '/', hospitalId: data.hospitalId },
    actions: [
      { action: 'view',    title: 'View Status' },
      { action: 'dismiss', title: 'Dismiss'     },
    ],
    vibrate: [200, 100, 200],
  };

  self.registration.showNotification(title, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
