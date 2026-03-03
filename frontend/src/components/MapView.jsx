import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import LocationHandler from "./LocationHandler";
import { metaForType } from "../constants/resourceTypes";
import styles from "./MapView.module.css";

function ZoomToLocation({ userLocation }) {
  const map = useMap();
  
  useEffect(() => {
    if (userLocation) {
      map.flyTo(userLocation, 15, {
        duration: 1.5 
      });
    }
  }, [userLocation, map]);
  
  return null;
}

// Create custom marker icon with Lucide icon
function createLucideMarkerIcon(color, IconComponent) {
  const iconHtml = renderToStaticMarkup(
    <div
      style={{
        backgroundColor: color,
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '3px solid white',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
      }}
    >
      <IconComponent size={18} color="white" strokeWidth={2.5} />
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
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
          const meta = metaForType(resource?.properties?.primary_type);
          const [lng, lat] = resource.geometry.coordinates;
          const IconComponent = meta.icon;
          
          return (
            <Marker
              key={resource.properties.id ?? `${lat},${lng}`}
              position={[lat, lng]}
              icon={createLucideMarkerIcon(meta.color, IconComponent)}
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