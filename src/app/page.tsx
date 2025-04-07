"use client";

import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useState } from "react";

const containerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "12px",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
};

const center = {
  lat: 42.3399,
  lng: -71.0899,
};

export default function Home() {
  const [map, setMap] = useState<google.maps.Map | null>(null);

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Blue Bike Safety App
            </h1>
            <p className="text-lg text-gray-600">
              Explore safe biking routes in Boston
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 h-[calc(100vh-200px)]">
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={13}
              onLoad={(map) => setMap(map)}
            >
              <Marker position={center} />
            </GoogleMap>
          </div>
        </div>
      </div>
    </LoadScript>
  );
}
