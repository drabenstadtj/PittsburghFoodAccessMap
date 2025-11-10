import './App.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import sampleData from './samplegeo.json';
import Navbar from './Navbar.jsx';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl} from 'react-leaflet';

// Custom Icons
const createCustomIcon = (type) => {
  let iconColor;
  
  switch(type) {
    case 'grocery':
      iconColor = '#2ecc71'; // Green
      break;
    case 'pantry':
      iconColor = '#e74c3c'; // Red
      break;
    case 'farmers market':
      iconColor = '#f39c12'; // Orange
      break;
    case 'community garden':
      iconColor = '#27ae60'; // Dark Green
      break;
    default:
      iconColor = '#3498db'; // Blue
  }

  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="background-color:${iconColor}" class="marker-pin"></div>`,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -42]
  });
};


//Had to do this weird reset I found on stack overflow in order to get the marker icons
//to appear - some quirk where react-leaflet doesn't include images and URLs must be manually reset
// Format hours for display
const formatHours = (hours) => {
  if (!hours) return 'Hours not available';
  return Object.entries(hours)
    .map(([day, time]) => `${day.charAt(0).toUpperCase() + day.slice(1)}: ${time || 'Closed'}`)
    .join('<br>');
};

function App() {
  const [sidebarOpen, setSideBarOpen] = useState(true);
  const collect = sampleData.features; // sample data used for testing frontend
  const [locationData, setData] = useState([]);

  // async call to get food locations from backend
  useEffect(() => {
    const fetchLocations = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/food-resources');
        const data = await response.json();
        setData(data.features);
    }
    catch (error) {
      console.error("Failed to fetch food locations: ", error);
    }
  };
    fetchLocations();
  }, []);
  
  const handleViewSidebar = () => {
    setSideBarOpen(!sidebarOpen);
  };

  return (
    <div className="App">
      <Navbar isOpen={sidebarOpen} toggleSidebar={handleViewSidebar} />
      <MapContainer 
        center={[40.4418, -79.972]} 
        zoom={13}
        scrollWheelZoom={true}
        className="map-container"
        zoomControl={false}
      >
      <ZoomControl position="bottomright"/>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locationData.map((p, index) => {
          const { properties, geometry } = p;
          const { name, resource_type, address, phone, website, description, benefits } = properties;
          
          const [lon, lat] = geometry.coordinates; // our DB stores coordinates in lon,lat order but leaflet expects lat,lon

          // plot points
          return (
            <Marker 
              key={`${name}-${index}`} 
              position={[lat, lon]}
              icon={createCustomIcon(resource_type)}
            >
              <Popup className="custom-popup">
                <div className="popup-content">
                  <h3 className="popup-title">{name}</h3>
                  <p className="popup-type">
                    <strong>Type:</strong> {resource_type.charAt(0).toUpperCase() + resource_type.slice(1)}
                  </p>
                  {address && (
                    <p className="popup-address">
                      <strong>Address:</strong> {address}
                    </p>
                  )}
                  {phone && (
                    <p className="popup-phone">
                      <strong>Phone:</strong> <a href={`tel:${phone}`}>{phone}</a>
                    </p>
                  )}
                  {website && (
                    <p className="popup-website">
                      <strong>Website:</strong>{' '}
                      <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noopener noreferrer">
                        Visit Website
                      </a>
                    </p>
                  )}
                  {benefits && Object.values(benefits).some(Boolean) && (
                    <div className="popup-benefits">
                      <strong>Accepts:</strong>
                      <ul>
                        {benefits.snap && <li>SNAP</li>}
                        {benefits.ebt && <li>EBT</li>}
                      </ul>
                    </div>
                  )}
                  {description && (
                    <p className="popup-description">
                      <em>{description}</em>
                    </p>
                  )}
                  <div className="popup-hours">
                    <strong>Hours:</strong>
                    <div dangerouslySetInnerHTML={{ __html: formatHours(properties.hours) }} />
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default App;