// scripts/inject-firebase-sw.js
// Runs before `react-scripts build` to bake Firebase config into the SW
// ─────────────────────────────────────────────────────────────────────────────
const fs   = require('fs');
const path = require('path');

const apiKey           = process.env.REACT_APP_FIREBASE_API_KEY            || '';
const authDomain       = process.env.REACT_APP_FIREBASE_AUTH_DOMAIN        || '';
const projectId        = process.env.REACT_APP_FIREBASE_PROJECT_ID         || '';
const storageBucket    = process.env.REACT_APP_FIREBASE_STORAGE_BUCKET     || '';
const messagingSenderId= process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID|| '';
const appId            = process.env.REACT_APP_FIREBASE_APP_ID             || '';

const swContent = `
// firebase-messaging-sw.js — AUTO-GENERATED at build time
// Do not edit manually — edit scripts/inject-firebase-sw.js instead

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            "${apiKey}",
  authDomain:        "${authDomain}",
  projectId:         "${projectId}",
  storageBucket:     "${storageBucket}",
  messagingSenderId: "${messagingSenderId}",
  appId:             "${appId}",
});

// Only activate messaging if credentials are present
if ("${apiKey}") {
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const { title, body } = payload.notification || {};
    const data = payload.data || {};

    if (!title) return;

    self.registration.showNotification(title, {
      body,
      icon:     '/logo192.png',
      badge:    '/logo192.png',
      tag:      'diversion-' + (data.hospitalId || 'update'),
      renotify: true,
      data:     { url: '/', hospitalId: data.hospitalId },
      actions:  [
        { action: 'view',    title: 'View Status' },
        { action: 'dismiss', title: 'Dismiss'     },
      ],
      vibrate: [200, 100, 200],
    });
  });
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
`.trimStart();

const outPath = path.join(__dirname, '..', 'public', 'firebase-messaging-sw.js');
fs.writeFileSync(outPath, swContent, 'utf8');

if (apiKey) {
  console.log('✓ firebase-messaging-sw.js generated with Firebase config');
} else {
  console.log('⚠ firebase-messaging-sw.js generated (no credentials — FCM disabled)');
  console.log('  Add REACT_APP_FIREBASE_* to Vercel environment variables to enable push notifications');
}
