
// listener for push notification
self.addEventListener("push", (e) => {
    var notification = e.data.json().notification;

    console.log(notification);

    var title = notification.title || "Yay a message";
    var body = notification.body || "You got a message.";
    var icon = "/img/icons/icon-192x192.png";

    e.waitUntil(
        self.registration.showNotification(title, {
            body: body,
            title: title
        })
    );
});

self.addEventListener("notificationclick", e => {
    e.notification.close();

    e.waitUntil(ClientRectList.matchAll({
        type: 'window',
    }).then(clients => {
        clients.forEach(client => {
            if (client.url === '/' && 'focus' in client)
                return client.focus();

            if (clients.openWindow)
                return clients.openWindow('/message');
        })
    }));
});