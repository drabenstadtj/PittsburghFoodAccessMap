import logo from './logo.svg';
import './App.css';
import './dist/leaflet.css'
import L from 'leaflet';
import sampleData from './samplegeo.json';
import markerIcon from './dist/images/marker-icon.png';
import markerShadow from './dist/images/marker-shadow.png'

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';


//Had to do this weird reset I found on stack overflow in order to get the marker icons
//to appear - some quirk where react-leaflet doesn't include images and URLs must be manually reset
let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow
});
L.Marker.prototype.options.icon = DefaultIcon;

function App() {
  const collect = sampleData.features;
  return (
    <div className="App">
      <MapContainer center={[40.4418, -79.972]} zoom={13} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {collect.map((p) => 
          <Marker position = {p.geometry.coordinates}>
            <Popup>
              {p.properties.name}
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

export default App;
