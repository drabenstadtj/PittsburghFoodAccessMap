import React from "react";
import ResourceCard from "./ResourceCard";
import styles from "./ListView.module.css";

export default function ListView({
  filteredResources,
  userLocation,
  onDirections,
  onMoreInfo,
  isMobile,
  searchQuery,
  setSearchQuery,
}) {
  return (
    <div className={styles.root}>
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
      
      <h2 className={styles.h2}>
        {filteredResources.length} Resource{filteredResources.length !== 1 ? "s" : ""}
      </h2>
      
      <div className={styles.list}>
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
    </div>
  );
}