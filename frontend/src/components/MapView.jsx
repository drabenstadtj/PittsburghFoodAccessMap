import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import LocationHandler from "./LocationHandler";
import { createCustomIcon } from "../utils/mapUtils";
import { metaForType } from "../constants/resourceIcons";
import styles from "./MapView.module.css";

// New component to handle zooming to user location
function ZoomToLocation({ userLocation }) {
  const map = useMap();
  
  useEffect(() => {
    if (userLocation) {
      map.flyTo(userLocation, 15, {
        duration: 1.5 // smooth animation
      });
    }
  }, [userLocation, map]);
  
  return null;
}

export default function MapView({
  filteredResources,
  userLocation,
  setUserLocation,
  isMobile,
  handleGetDirections,
  handleMoreInfo,
  center = [40.4406, -79.9959],
}) {
  return (
    <div className={styles.container}>
      <MapContainer
        center={userLocation || center}
        zoom={12}
        className={styles.map}
        zoomControl={!isMobile}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationHandler setUserLocation={setUserLocation} />
        <ZoomToLocation userLocation={userLocation} />
        
        {filteredResources.map((resource) => {
          const meta = metaForType(resource?.properties?.resource_type);
          const [lng, lat] = resource.geometry.coordinates;
          return (
            <Marker
              key={resource.properties.id ?? `${lat},${lng}`}
              position={[lat, lng]}
              icon={createCustomIcon(meta.color, meta.symbol)}
            >
              <Popup>
                <div style={{ minWidth: 200 }}>
                  <h4 style={{ margin: "0 0 8px 0" }}>
                    {resource.properties.name}
                  </h4>
                  <p
                    style={{
                      margin: "0 0 8px 0",
                      fontSize: 14,
                      color: "#6c757d",
                    }}
                  >
                    {resource.properties.address}
                  </p>
                  <div className={styles.popupActions}>
                    <button
                      onClick={() => handleGetDirections(resource)}
                      className={styles.popupPrimary}
                    >
                      Directions
                    </button>
                    <button
                      onClick={() => handleMoreInfo(resource)}
                      className={styles.popupButton}
                    >
                      Details
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
        
        {userLocation && (
          <Marker
            position={userLocation}
            icon={L.divIcon({
              html: '<div style="background: #007bff; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
              className: "user-location-marker",
              iconSize: [22, 22],
              iconAnchor: [11, 11],
            })}
          >
            <Popup>Your Location</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}