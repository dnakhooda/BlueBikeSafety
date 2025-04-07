"use client";

import {
  GoogleMap,
  LoadScript,
  Marker,
  Autocomplete,
} from "@react-google-maps/api";
import { useState, useEffect, useRef } from "react";

interface BlueBikeStation {
  name: string;
  latitude: number;
  longitude: number;
}

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
  const [stations, setStations] = useState<BlueBikeStation[]>([]);
  const [selectedStation, setSelectedStation] =
    useState<BlueBikeStation | null>(null);
  const [searchBox, setSearchBox] =
    useState<google.maps.places.Autocomplete | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch("/api/stations");
        const data = await response.json();
        setStations(data);
      } catch (error) {
        console.error("Error fetching stations:", error);
      }
    };

    fetchStations();
  }, []);

  const onPlaceChanged = () => {
    if (searchBox && map) {
      const place = searchBox.getPlace();
      if (place.geometry?.location) {
        map.panTo(place.geometry.location);
        map.setZoom(15);
      }
    }
  };

  return (
    <LoadScript
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
      libraries={["places"]}
    >
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Blue Bike Safety App
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Explore safe biking routes in Boston
            </p>

            <div className="max-w-xl mx-auto">
              <Autocomplete
                onLoad={setSearchBox}
                onPlaceChanged={onPlaceChanged}
              >
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Enter an address in Boston"
                  className="text-black w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                />
              </Autocomplete>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 h-[calc(100vh-300px)]">
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={13}
              onLoad={(map) => setMap(map)}
            >
              {stations.map((station, index) => (
                <Marker
                  key={index}
                  position={{
                    lat: parseFloat(station.latitude.toString()),
                    lng: parseFloat(station.longitude.toString()),
                  }}
                  title={station.name}
                  onClick={() => setSelectedStation(station)}
                />
              ))}
            </GoogleMap>
          </div>

          {selectedStation && (
            <div className="mt-4 bg-white rounded-lg shadow-md p-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {selectedStation.name}
              </h2>
              <p className="text-gray-600 mt-1">
                Located at: {selectedStation.latitude.toFixed(4)},{" "}
                {selectedStation.longitude.toFixed(4)}
              </p>
            </div>
          )}
        </div>
      </div>
    </LoadScript>
  );
}
