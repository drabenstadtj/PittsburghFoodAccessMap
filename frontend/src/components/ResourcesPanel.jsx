import React from "react";
import ResourceCard from "./ResourceCard";
import styles from "./ResourcesPanel.module.css";

export default function ResourcesPanel({
  filteredResources,
  userLocation,
  onDirections,
  onMoreInfo,
  isMobile,
  searchQuery,
  setSearchQuery,
}) {
  return (
    <aside className={styles.panel}>
      {isMobile && (
        <div className={styles.searchSection}>
          <input
            type="text"
            placeholder="Search by name, address, or neighborhood..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      )}
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
            isMobile={isMobile}
          />
        ))}
      </div>
    </aside>
  );
}