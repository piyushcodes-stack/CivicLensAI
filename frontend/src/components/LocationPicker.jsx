import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons in Vite
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function LocationMarker({ position, onLocationSelect }) {
  useMapEvents({
    click(event) {
      onLocationSelect({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });

  return position ? (
    <Marker position={position} icon={defaultIcon} />
  ) : null;
}

export default function LocationPicker({
  latitude,
  longitude,
  onLocationSelect,
}) {
  const [position, setPosition] = useState(
    latitude !== "" &&
      latitude !== null &&
      latitude !== undefined &&
      longitude !== "" &&
      longitude !== null &&
      longitude !== undefined
      ? [Number(latitude), Number(longitude)]
      : null
  );

  const defaultCenter = [19.2183, 72.9781]; // Thane, Maharashtra

  async function handleLocationSelect(location) {
  setPosition([location.latitude, location.longitude]);

  onLocationSelect(location);

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${location.latitude}&lon=${location.longitude}`
    );

    if (!response.ok) {
      throw new Error("Unable to fetch address");
    }

    const data = await response.json();

    const address = data.display_name || "";

    if (address) {
      onLocationSelect({
        ...location,
        address,
      });
    }
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
  }
}

  return (
    <div className="location-picker">
      <h3>📍 Select Complaint Location</h3>

      <p>Click anywhere on the map to select the complaint location.</p>

      <MapContainer
        center={position || defaultCenter}
        zoom={13}
        style={{
          height: "350px",
          width: "100%",
          borderRadius: "12px",
          zIndex: 1,
        }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LocationMarker
          position={position}
          onLocationSelect={handleLocationSelect}
        />
      </MapContainer>

      {position && (
        <div className="selected-location">
          <p>
            <strong>Latitude:</strong> {position[0].toFixed(6)}
          </p>
          <p>
            <strong>Longitude:</strong> {position[1].toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
}