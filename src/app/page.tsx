"use client";

import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";

const location1 = { lat: 42.3399, lng: -71.0899 };
const location2 = { lat: 42.3499, lng: -71.0799 };

export default function Home() {
  const [apiLoaded, setApiLoaded] = useState(false);

  useEffect(() => {
    if (window.google) {
      setApiLoaded(true);
    }
  }, []);

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <header className="w-full h-[3em] bg-[#bbb] dark:bg-[#222]">

      </header>

      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <h1 className="text-[2rem] font-bold">Blue Bike Safety App</h1>
        <Map
          center={location1}
          zoom={12}
          mapId="YOUR_MAP_ID"
          style={{ width: "100%", height: "500px" }}
          disableDefaultUI={false}
          zoomControl={true}
          gestureHandling="greedy">
          {apiLoaded && (
            <>
              <AdvancedMarker position={location1}>
                <div style={{ fontSize: "2rem" }}>📍</div>
              </AdvancedMarker>
              <AdvancedMarker position={location2}>
                <div style={{ fontSize: "2rem" }}>📍</div>
              </AdvancedMarker>
            </>
          )}
        </Map>
      </div>
    </APIProvider>
  );
}
