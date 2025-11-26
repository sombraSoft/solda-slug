declare global {
  interface Window {
    fbq: (
      action: string,
      eventName: string,
      params?: Record<string, string | number | boolean>,
    ) => void;
  }
}

const standardEvents = new Set([
  "AddPaymentInfo",
  "AddToCart",
  "AddToWishlist",
  "CompleteRegistration",
  "Contact",
  "CustomizeProduct",
  "Donate",
  "FindLocation",
  "InitiateCheckout",
  "Lead",
  "PageView",
  "Purchase",
  "Schedule",
  "Search",
  "StartTrial",
  "SubmitApplication",
  "Subscribe",
  "ViewContent",
]);

export const trackEvent = (
  eventName: string,
  params?: Record<string, string | number | boolean>,
) => {
  if (typeof window.fbq === "function") {
    const trackType = standardEvents.has(eventName) ? "track" : "trackCustom";
    window.fbq(trackType, eventName, params);
  } else {
    console.warn("Meta Pixel not initialized, skipping event:", eventName);
  }
};
