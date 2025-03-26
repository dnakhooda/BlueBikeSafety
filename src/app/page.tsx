"use client"

import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useState } from "react";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const center = {
  lat: 42.3399,
  lng: -71.0899,
};

export default function Home() {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  
  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <h1 className="text-[2rem] font-bold">Blue Bike Safety App</h1>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={12}
          onLoad={(map) => setMap(map)}>
          <Marker position={center} />
        </GoogleMap>
      </div>
    </LoadScript>
  );
}
