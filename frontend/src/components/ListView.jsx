import React from "react";
import ResourceCard from "./ResourceCard";
import styles from "./ListView.module.css";

export default function ListView({
  filteredResources,
  userLocation,
  onDirections,
  onMoreInfo,
  isMobile,
}) {
  return (
    <div className={styles.root}>
      <div className={styles.inner}>
        <h2 className={styles.h2}>
          Food Resources ({filteredResources.length})
        </h2>
        {filteredResources.length === 0 ? (
          <div className={styles.empty}>
            No resources found. Try adjusting your filters.
          </div>
        ) : (
          filteredResources.map((resource) => (
            <ResourceCard
              key={resource.properties.id}
              resource={resource}
              userLocation={userLocation}
              onDirections={onDirections}
              onMoreInfo={onMoreInfo}
              isMobile={isMobile}
            />
          ))
        )}
      </div>
    </div>
  );
}
