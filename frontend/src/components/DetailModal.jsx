import React, { useState } from "react";
import { RESOURCE_ICONS } from "../constants/resourceIcons";
import styles from "./DetailModal.module.css";

import ReportModal from "./ReportModal";

// converts military time to 12 hour time 
function military_to_twelve(t)
{
  // check that given argument is valid
  if (!t || typeof t !== "string") return t;

  return t.replace(
    /\b(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})\b/g,
    (_, h1, m1, h2, m2) => {
      const format = (h, m) => {
        h = parseInt(h, 10);
        const period = h >= 12 ? "PM" : "AM";
        h = h % 12 || 12; // 0 => 12
        return `${h}:${m} ${period}`;
      };
      return `${format(h1, m1)}-${format(h2, m2)}`;
    }
  );
}

export default function DetailModal({ resource, onClose }) {
  const [showReportModal, setShowReportModal] = useState(false);

  if (!resource) return null;

  const iconCfg = RESOURCE_ICONS[resource.properties.resource_type];
  const chipColor = iconCfg?.color || "#6c757d";
  const hours = resource.properties.hours;

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{resource.properties.name}</h2>
            <div className={styles.chip} style={{ background: chipColor }}>
              {iconCfg?.label || resource.properties.resource_type}
            </div>
          </div>
          <button onClick={onClose} className={styles.close}>
            ✕
          </button>
        </div>

        <div className={styles.body}>
          {resource.properties.address && (
            <div className={styles.block}>
              <strong>Address:</strong>
              <br />
              {resource.properties.address}
              <br />
              {resource.properties.neighborhood &&
                `${resource.properties.neighborhood}, Pittsburgh, PA`}
            </div>
          )}

          {hours && (
            <div className={styles.block}>
              <strong>Hours:</strong>
              <br />
              {typeof hours === "object"
                ? Object.entries(hours).map(([day, time]) => (
                    <div key={day}>
                      {day.charAt(0).toUpperCase() + day.slice(1)}: {military_to_twelve(time)}
                    </div>
                  ))
                : military_to_twelve(hours)}

            </div>
          )}

          {resource.properties.phone && (
            <div className={styles.block}>
              <strong>Phone:</strong>
              <br />
              <a href={`tel:${resource.properties.phone}`}>
                {resource.properties.phone}
              </a>
            </div>
          )}

          {resource.properties.website && (
            <div className={styles.block}>
              <strong>Website:</strong>
              <br />
              <a
                href={resource.properties.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                {resource.properties.website}
              </a>
            </div>
          )}

          {resource.properties.description && (
            <div className={styles.block}>
              <strong>Description:</strong>
              <br />
              {resource.properties.description}
            </div>
          )}

          <div className={styles.footer}>
            <button
              onClick={() => setShowReportModal(true)}
              className={styles.reportBtn}
            >
              Report an Issue with This Location
            </button>

            {showReportModal && (
              <ReportModal
                resource={resource}
                onClose={() => setShowReportModal(false)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
