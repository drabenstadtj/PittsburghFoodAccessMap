// src/utils/location.js
export function requestLocation({ onSuccess, onError } = {}) {
  if (!("geolocation" in navigator)) {
    onError?.("Geolocation is not supported by this browser.");
    return;
  }

  const ask = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => onSuccess?.([pos.coords.latitude, pos.coords.longitude]),
      (err) => {
        let msg = "Failed to get location.";
        if (err.code === err.PERMISSION_DENIED) {
          msg =
            "Location permission denied. In Safari, allow location for this site.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = "Location unavailable. Try again near a window or on Wi-Fi.";
        } else if (err.code === err.TIMEOUT) {
          msg = "Location timed out. Try again.";
        }
        onError?.(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // unable to check if this part works as it will only be allowed on https (dev server is http only)
  if (navigator.permissions?.query) {
    navigator.permissions
      .query({ name: "geolocation" })
      .then((status) => {
        if (status.state === "denied") {
          onError?.(
            "Location permission is blocked. In Safari: aA → Website Settings → Location → Allow."
          );
        } else {
          ask(); // "granted" or "prompt" → will trigger native prompt on click
        }
      })
      .catch(ask);
  } else {
    ask();
  }
}

// helper if you want to feature-detect before showing a button
// unable to check if this part works as it will only be allowed on https (dev server is http only)
export function canUseGeolocation() {
  return typeof window !== "undefined" && "geolocation" in navigator;
}
