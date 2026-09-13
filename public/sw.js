/*
 * Push bildirishnomalari uchun service worker.
 *
 * Ataylab `public/` da: bu fayl ilova to'plamidan tashqarida, sayt ildizidan
 * (`/sw.js`) berilishi kerak — shundagina uning qamrovi butun ilovani qoplaydi.
 * Shu sababli bu yerda `import` ishlatilmaydi va TypeScript ham yo'q.
 */

/** Server yuborgan tanani o'qiydi. JSON bo'lmasa — oddiy matn deb qaraymiz. */
function readPayload(event) {
  if (!event.data) return {};
  try {
    return event.data.json();
  } catch (error) {
    return { body: event.data.text() };
  }
}

self.addEventListener("push", (event) => {
  const payload = readPayload(event);
  const title = payload.title || "YolUp";
  const options = {
    body: payload.body || payload.description || "",
    icon: "/notification-icon.png",
    badge: "/notification-icon.png",
    /* Bir xil `tag` li xabar eskisining ustiga tushadi — bir dars uchun
       takroriy eslatma qalashib qolmaydi. */
    tag: payload.tag || undefined,
    data: { url: payload.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      /* Ilova allaqachon ochiq bo'lsa yangi oyna ochmaymiz — o'shanisiga o'tamiz. */
      for (const client of clients) {
        if ("focus" in client) {
          await client.focus();
          if ("navigate" in client) await client.navigate(url);
          return;
        }
      }
      await self.clients.openWindow(url);
    })()
  );
});
