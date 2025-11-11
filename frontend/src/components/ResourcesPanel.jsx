import React from "react";
import ResourceCard from "./ResourceCard";
import styles from "./ResourcesPanel.module.css";

export default function ResourcesPanel({
  filteredResources,
  userLocation,
  onDirections,
  onMoreInfo,
}) {
  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>Resources ({filteredResources.length})</h2>
      </div>
      <div className={styles.scroll}>
        {filteredResources.map((resource) => (
          <ResourceCard
            key={resource.properties.id}
            resource={resource}
            userLocation={userLocation}
            onDirections={onDirections}
            onMoreInfo={onMoreInfo}
            isMobile={false}
          />
        ))}
      </div>
    </aside>
  );
}
