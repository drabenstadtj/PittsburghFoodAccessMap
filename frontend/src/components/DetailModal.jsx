import { useState } from "react";
import { RESOURCE_ICONS } from "../constants/resourceIcons";
import styles from "./DetailModal.module.css";
import HoursDisplay from "../pages/admin/HoursDisplay";
import ReportModal from "./ReportModal";

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
              <HoursDisplay hours={hours} />
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
