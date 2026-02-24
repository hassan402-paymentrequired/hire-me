self.addEventListener("install", function(event) {
    console.log(event)
    self.skipWaiting();
});

self.addEventListener("activate", function(event) {
    console.log(event)
    event.waitUntil(self.clients.claim());
});


self.addEventListener('push', function (event) {
    console.log(event)
    if (!event.data) return;
    let payload;
    try {
        payload = event.data.json();
    } catch {
        payload = { title: 'Notification', body: '' };
    }
    const title = payload.title || 'Notification';
    const body = payload.body || '';
    const icon = payload.icon || '/logo/android-chrome-192x192.png';
    const url = (payload.data && payload.data.url) ? payload.data.url : '/';
    const options = {
        body,
        icon,
        badge: icon,
        data: { url },
        tag: payload.tag || 'default',
        renotify: true,
    };
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', function (event) {
    console.log(event)
    event.notification.close();
    const url = event.notification.data && event.notification.data.url ? event.notification.data.url : '/';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url && 'focus' in client) {
                    client.navigate(url);
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});
