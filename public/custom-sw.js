self.addEventListener('push', function (event) {
    const data = event.data ? event.data.json() : {};
    const title = data.title || "GateSIM";
    const options = {
        body: data.body || "Таны eSIM-ийн мэдээлэл шинэчлэгдлээ.",
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        data: { url: data.url || "/" }
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            if (clientList.length > 0) {
                let client = clientList[0];
                for (let i = 0; i < clientList.length; i++) {
                    if (clientList[i].focused) {
                        client = clientList[i];
                    }
                }
                return client.focus();
            }
            return clients.openWindow(event.notification.data.url);
        })
    );
});
