import L from "leaflet";

export const createCustomIcon = (color, symbol) =>
    L.divIcon({
        html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        border: 2px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="transform: rotate(45deg); font-size: 16px;">${symbol}</span>
      </div>
    `,
        className: "custom-div-icon",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });

const DAYS = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
];

// Parses "9:00 AM" or "5:00 PM" into minutes since midnight
const timeToMinutes = (timeStr) => {
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return -1;
    let hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    const period = match[3].toUpperCase();
    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    return hour * 60 + minute;
};

// Returns true if the resource is currently open based on its hours JSON
export const isOpenNow = (hours) => {
    let hoursObj = hours;
    if (typeof hours === "string") {
        try {
            hoursObj = JSON.parse(hours);
        } catch {
            return false;
        }
    }
    if (!hoursObj || typeof hoursObj !== "object") return false;

    const now = new Date();
    const day = DAYS[now.getDay()];
    const dayHours = hoursObj[day];

    if (!dayHours || dayHours === "Closed" || dayHours === "Not set")
        return false;
    if (dayHours === "Open 24 hours") return true;

    // Expect format: "9:00 AM - 5:00 PM"
    const parts = dayHours.split(/\s*[-–]\s*/);
    if (parts.length !== 2) return false;

    const openMinutes = timeToMinutes(parts[0]);
    const closeMinutes = timeToMinutes(parts[1]);
    if (openMinutes === -1 || closeMinutes === -1) return false;

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 3958.8; // miles
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
