let sdkPromise;
export function loadGoogleIdentityServices() {
  if (window.google?.accounts?.oauth2) return Promise.resolve(window.google);
  if (!sdkPromise) sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    const timer = setTimeout(() => { script.remove(); sdkPromise = null; reject(new Error("Google sign-in could not load. Check your connection or browser blocking settings and retry.")); }, 15000);
    script.onload = () => { clearTimeout(timer); if (window.google?.accounts?.oauth2) resolve(window.google); else { sdkPromise = null; reject(new Error("Google sign-in is unavailable. Please reload and retry.")); } };
    script.onerror = () => { clearTimeout(timer); script.remove(); sdkPromise = null; reject(new Error("Google sign-in could not load. Check your connection or browser blocking settings and retry.")); };
    document.head.appendChild(script);
  });
  return sdkPromise;
}
