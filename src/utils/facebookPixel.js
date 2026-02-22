let pixelInitialized = false;

export const initFacebookPixel = (pixelId) => {
  if (typeof window === 'undefined') return;
  if (!pixelId || pixelInitialized) return;

  pixelInitialized = true;

  // Standard Meta Pixel initialization snippet
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = 'https://connect.facebook.net/en_US/fbevents.js';
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script');

  window.fbq('init', pixelId);
  window.fbq('track', 'PageView');
};

export const trackPageView = () => {
  if (typeof window === 'undefined') return;
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'PageView');
  }
};

