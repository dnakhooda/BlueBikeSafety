"use client";

import {
  GoogleMap,
  LoadScript,
  Marker,
  Autocomplete,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { useState, useEffect, useRef } from "react";

interface BlueBikeStation {
  name: string;
  latitude: number;
  longitude: number;
}

const center = {
  lat: 42.3399,
  lng: -71.0899,
};

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function Home() {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [stations, setStations] = useState<BlueBikeStation[]>([]);
  const [filteredStations, setFilteredStations] = useState<BlueBikeStation[]>(
    []
  );
  const [selectedStation, setSelectedStation] =
    useState<BlueBikeStation | null>(null);
  const [searchBox, setSearchBox] =
    useState<google.maps.places.Autocomplete | null>(null);
  const [searchLocation, setSearchLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const [closestStation, setClosestStation] = useState<BlueBikeStation | null>(
    null
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const directionsService = useRef<google.maps.DirectionsService | null>(null);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch("/api/stations");
        const data = await response.json();
        setStations(data);
        setFilteredStations(data);
      } catch (error) {
        console.error("Error fetching stations:", error);
      }
    };

    fetchStations();
  }, []);

  useEffect(() => {
    if (searchLocation) {
      const nearbyStations = stations.filter((station) => {
        const distance = calculateDistance(
          searchLocation.lat,
          searchLocation.lng,
          parseFloat(station.latitude.toString()),
          parseFloat(station.longitude.toString())
        );
        return distance <= 0.5;
      });
      setFilteredStations(nearbyStations);

      if (nearbyStations.length > 0) {
        const closest = nearbyStations.reduce((prev, curr) => {
          const prevDistance = calculateDistance(
            searchLocation.lat,
            searchLocation.lng,
            parseFloat(prev.latitude.toString()),
            parseFloat(prev.longitude.toString())
          );
          const currDistance = calculateDistance(
            searchLocation.lat,
            searchLocation.lng,
            parseFloat(curr.latitude.toString()),
            parseFloat(curr.longitude.toString())
          );
          return currDistance < prevDistance ? curr : prev;
        });
        setClosestStation(closest);
      }
    } else {
      setFilteredStations([]);
      setClosestStation(null);
      setSelectedStation(null);
      setDirections(null);
    }
  }, [searchLocation, stations]);

  useEffect(() => {
    if (map && searchLocation && !directionsService.current) {
      directionsService.current = new google.maps.DirectionsService();
    }
  }, [map, searchLocation]);

  const zoomToAllStations = () => {
    if (map && filteredStations.length > 0) {
      const bounds = new google.maps.LatLngBounds();

      filteredStations.forEach((station) => {
        bounds.extend(
          new google.maps.LatLng(
            parseFloat(station.latitude.toString()),
            parseFloat(station.longitude.toString())
          )
        );
      });

      if (searchLocation) {
        bounds.extend(
          new google.maps.LatLng(searchLocation.lat, searchLocation.lng)
        );
      }

      map.fitBounds(bounds);
    }
  };

  const handleStationClick = (station: BlueBikeStation) => {
    if (selectedStation === station) {
      setSelectedStation(null);
      setDirections(null);
      zoomToAllStations();
      return;
    }

    setSelectedStation(station);
    if (map && searchLocation && directionsService.current) {
      const origin = new google.maps.LatLng(
        searchLocation.lat,
        searchLocation.lng
      );
      const destination = new google.maps.LatLng(
        parseFloat(station.latitude.toString()),
        parseFloat(station.longitude.toString())
      );

      directionsService.current.route(
        {
          origin,
          destination,
          travelMode: google.maps.TravelMode.WALKING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            setDirections(result);
          }
        }
      );
    }

    if (map) {
      map.panTo({
        lat: parseFloat(station.latitude.toString()),
        lng: parseFloat(station.longitude.toString()),
      });
    }
  };

  const onPlaceChanged = () => {
    if (searchBox && map) {
      const place = searchBox.getPlace();
      if (place.geometry?.location) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setSearchLocation(location);
        setDirections(null);
        setSelectedStation(null);
        map.panTo(location);
        map.setZoom(15);
      }
    }
  };

  const getSortedStations = () => {
    if (!searchLocation) return [];

    return [...filteredStations].sort((a, b) => {
      const distanceA = calculateDistance(
        searchLocation.lat,
        searchLocation.lng,
        parseFloat(a.latitude.toString()),
        parseFloat(a.longitude.toString())
      );
      const distanceB = calculateDistance(
        searchLocation.lat,
        searchLocation.lng,
        parseFloat(b.latitude.toString()),
        parseFloat(b.longitude.toString())
      );
      return distanceA - distanceB;
    });
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
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-black"
                />
              </Autocomplete>
            </div>
          </div>

          <div className="flex gap-4">
            <div
              className={`bg-white rounded-xl shadow-lg p-4 transition-all duration-300 ${
                isSidebarOpen ? "w-90" : "w-12"
              }`}
            >
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="mb-4 text-gray-500 hover:text-gray-700"
              >
                {isSidebarOpen ? "←" : "→"}
              </button>

              {isSidebarOpen && (
                <div>
                  <h2 className="text-black text-xl font-semibold mb-4">
                    Nearby Stations
                  </h2>
                  <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto">
                    {getSortedStations().map((station, index) => {
                      const distance = searchLocation
                        ? calculateDistance(
                            searchLocation.lat,
                            searchLocation.lng,
                            parseFloat(station.latitude.toString()),
                            parseFloat(station.longitude.toString())
                          )
                        : 0;

                      return (
                        <div
                          key={index}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedStation === station
                              ? "bg-blue-50 border border-blue-200"
                              : "hover:bg-gray-50 border border-gray-100"
                          }`}
                          onClick={() => handleStationClick(station)}
                        >
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-gray-900">
                              {station.name}
                            </h3>
                            <span className="text-sm font-medium text-gray-600">
                              {distance.toFixed(2)} mi
                            </span>
                          </div>
                          {station === closestStation && (
                            <span className="inline-block mt-1 text-xs text-green-600 font-medium">
                              Closest Station
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 bg-white rounded-xl shadow-lg p-4 h-[calc(100vh-300px)]">
              <div className="w-full h-full rounded-lg overflow-hidden">
                <GoogleMap
                  mapContainerClassName="w-full h-full rounded-lg"
                  center={center}
                  zoom={13}
                  onLoad={(map) => setMap(map)}
                >
                  {filteredStations.map((station, index) => (
                    <Marker
                      key={index}
                      position={{
                        lat: parseFloat(station.latitude.toString()),
                        lng: parseFloat(station.longitude.toString()),
                      }}
                      title={station.name}
                      onClick={() => handleStationClick(station)}
                      icon={{
                        url:
                          station === closestStation
                            ? "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                            : "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                        scaledSize: new google.maps.Size(32, 32),
                      }}
                    />
                  ))}
                  {directions && <DirectionsRenderer directions={directions} />}
                </GoogleMap>
              </div>
            </div>
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
              {searchLocation && (
                <p className="text-gray-600 mt-1">
                  Distance:{" "}
                  {calculateDistance(
                    searchLocation.lat,
                    searchLocation.lng,
                    parseFloat(selectedStation.latitude.toString()),
                    parseFloat(selectedStation.longitude.toString())
                  ).toFixed(1)}{" "}
                  miles away
                </p>
              )}
              {selectedStation === closestStation && searchLocation && (
                <p className="text-green-600 mt-2 font-medium">
                  This is the closest station to your location!
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </LoadScript>
  );
}
