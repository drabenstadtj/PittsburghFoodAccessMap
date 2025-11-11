import React, { useEffect, useState } from "react";
import { calculateDistance } from "../utils/mapUtils";
import { metaForType } from "../constants/resourceIcons";
import styles from "./ResourceCard.module.css";

export default function ResourceCard({
  resource,
  userLocation,
  onDirections,
  onMoreInfo,
  isMobile,
}) {
  const [distance, setDistance] = useState(null);
  const [openNow, setOpenNow] = useState(null);

  const parseTimeToHours = (s) => {
    if (!s) return null;
    const str = s.trim().toLowerCase().replace(/\s/g, "");
    const m = str.match(/^(\d{1,2})(?::(\d{2}))?(am|pm)?$/);
    if (!m) return null;
    let h = Number(m[1]);
    const mins = m[2] ? Number(m[2]) : 0;
    const ap = m[3];
    if (ap === "am") {
      if (h === 12) h = 0;
    } else if (ap === "pm") {
      if (h !== 12) h += 12;
    }
    return h + mins / 60;
  };

  const parseRange = (range) => {
    if (!range) return null;
    const raw = String(range).trim();
    if (/^closed$/i.test(raw)) return { closed: true };
    const norm = raw.replace(/[–—]/g, "-");
    const [openStr, closeStr] = norm.split("-").map((t) => t?.trim());
    if (!openStr || !closeStr) return null;
    const open = parseTimeToHours(openStr);
    const close = parseTimeToHours(closeStr);
    if (open == null || close == null) return null;
    return { open, close, closed: false };
  };

  useEffect(() => {
    const hours = resource?.properties?.hours;
    if (!hours || typeof hours !== "object") {
      setOpenNow(null);
      return;
    }
    const now = new Date();
    const dayIdx = now.getDay();
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const today = days[dayIdx];
    const currentTime = now.getHours() + now.getMinutes() / 60;
    const todaySpec = hours[today];
    if (!todaySpec) {
      setOpenNow(null);
      return;
    }
    const rng = parseRange(todaySpec);
    if (!rng) {
      setOpenNow(null);
      return;
    }
    if (rng.closed) {
      setOpenNow(false);
      return;
    }
    if (rng.close < rng.open) {
      setOpenNow(currentTime >= rng.open || currentTime <= rng.close);
      return;
    }
    setOpenNow(currentTime >= rng.open && currentTime <= rng.close);
  }, [resource]);

  useEffect(() => {
    if (!userLocation) {
      setDistance(null);
      return;
    }
    const coords = resource?.geometry?.coordinates;
    const lat = coords ? coords[1] : resource?.properties?.latitude;
    const lon = coords ? coords[0] : resource?.properties?.longitude;
    if (typeof lat === "number" && typeof lon === "number") {
      const d = calculateDistance(userLocation[0], userLocation[1], lat, lon);
      setDistance(d);
    } else {
      setDistance(null);
    }
  }, [userLocation, resource]);

  const type = resource?.properties?.resource_type;
  const meta = metaForType(type);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.icon} style={{ background: meta.color }}>
          {meta.symbol}
        </span>
        <h3 className={styles.title}>{resource?.properties?.name}</h3>
        <span className={styles.pill}>{meta.label}</span>
      </div>

      <div className={styles.body}>
        {distance != null && (
          <p className={styles.meta}>{distance.toFixed(1)} miles away</p>
        )}
        {openNow === null ? (
          <p className={styles.meta}>Hours unavailable</p>
        ) : openNow ? (
          <p className={`${styles.meta} ${styles.open}`}>🟢 Open now</p>
        ) : (
          <p className={`${styles.meta} ${styles.closed}`}>🔴 Closed</p>
        )}
        {resource?.properties?.address && (
          <p className={styles.meta}>{resource.properties.address}</p>
        )}
        {resource?.properties?.phone && (
          <p className={styles.meta}>📞 {resource.properties.phone}</p>
        )}
        {resource?.properties?.website && (
          <p className={styles.meta}>
            <a
              href={resource.properties.website}
              target="__blank"
              rel="noreferrer"
            >
              Website
            </a>
          </p>
        )}
      </div>

      <div className={styles.buttons}>
        <button
          className={styles.primary}
          onClick={() => onDirections(resource)}
        >
          Get Directions
        </button>
        <button className={styles.btn} onClick={() => onMoreInfo(resource)}>
          More Info
        </button>
      </div>
    </div>
  );
}
