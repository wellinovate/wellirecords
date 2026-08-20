if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
      for (let registration of registrations) {
        registration.unregister();
        console.log('ServiceWorker unregistered successfully.');
      }
    });
  });
}

// Prevent text copying outside form input elements
document.addEventListener('copy', function (e) {
  const activeEl = document.activeElement;
  const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable);
  if (!isInput) {
    e.preventDefault();
  }
});
document.addEventListener('cut', function (e) {
  const activeEl = document.activeElement;
  const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable);
  if (!isInput) {
    e.preventDefault();
  }
});
