// تسجيل Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Verificar si estamos en un entorno HTTP/HTTPS
    if (window.location.protocol === 'https:' || window.location.protocol === 'http:') {
      // Usar una ruta relativa en lugar de absoluta
      navigator.serviceWorker.register('./service-worker.js')
        .then(registration => {
          console.log('تم تسجيل Service Worker بنجاح:', registration.scope);
        })
        .catch(error => {
          console.error('فشل تسجيل Service Worker:', error);
        });
    } else {
      console.log('Service Worker no registrado: se requiere un servidor HTTP/HTTPS');
    }
  });
}
