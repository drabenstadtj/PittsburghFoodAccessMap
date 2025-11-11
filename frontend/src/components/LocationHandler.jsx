import { useMap, useMapEvents } from "react-leaflet";

export default function LocationHandler({ setUserLocation }) {
  const map = useMap();

  useMapEvents({
    locationfound: (e) => {
      setUserLocation([e.latlng.lat, e.latlng.lng]);
      map.flyTo(e.latlng, 14);
    },
  });

  return null;
}
