declare global {
  interface Window {
    fbq: (
      action: string,
      eventName: string,
      params?: Record<string, string | number | boolean>,
    ) => void;
  }
}

export const trackEvent = (
  eventName: string,
  params?: Record<string, string | number | boolean>,
) => {
  if (typeof window.fbq === "function") {
    window.fbq("track", eventName, params);
  } else {
    console.warn("Meta Pixel not initialized, skipping event:", eventName);
  }
};
