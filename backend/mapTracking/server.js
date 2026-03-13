
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import { io } from "socket.io-client";
import "leaflet/dist/leaflet.css";

// Fix default icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

export default function BusMap() {
  const [carLocations, setCarLocations] = useState([]); // All positions
  const [route, setRoute] = useState([]); // Full route

  useEffect(() => {
    const socket = io("http://localhost:4000");

    socket.on("full-route", (data) => {
      setRoute(data);
    });

    socket.on("receive-location", (data) => {
      setCarLocations((prev) => [...prev, [data.latitude, data.longitude]]);
    });

    return () => socket.disconnect();
  }, []);

  // Center map at first point or default
  const center = route.length ? route[0] : [28.6304, 77.2177];

  return (
    <MapContainer center={center} zoom={12} style={{ height: "100vh", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {/* Draw the full route as light gray line */}
      {route.length > 0 && <Polyline positions={route} color="lightgray" weight={3} />}

      {/* Draw the car's traveled path as blue line */}
      {carLocations.length > 1 && <Polyline positions={carLocations} color="blue" weight={4} />}

      {/* Current car position marker */}
      {carLocations.length > 0 && (
        <Marker position={carLocations[carLocations.length - 1]}>
          <Popup>Test Car</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
