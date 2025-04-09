"use client";

import {
  GoogleMap,
  LoadScript,
  Marker,
  Autocomplete,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";
import Navigation from "./components/navigation";
import { BlueBikeStation, Accident, Fatality } from "./types/types";
import {
  calculateDistance,
  calculateSafetyScore,
  getMarkerIcon,
  getSafetyColor,
  getUserLocationMarkerIcon,
} from "./utils/utils";
import { chartStyles } from "./other/MapStyles";

const center = {
  lat: 42.3399,
  lng: -71.0899,
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
  const [safestStation, setSafestStation] = useState<BlueBikeStation | null>(
    null
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [accidents, setAccidents] = useState<Accident[]>([]);
  const [fatalities, setFatalities] = useState<Fatality[]>([]);
  const [showNoStationsPopup, setShowNoStationsPopup] = useState(false);
  const { isDarkMode } = useTheme();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const directionsService = useRef<google.maps.DirectionsService | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const stationRefs = useRef<Map<string, HTMLDivElement>>(new Map());

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

  const fetchAccidents = async () => {
    try {
      const response = await fetch("/api/accidents");
      const data = await response.json();
      setAccidents(data);
    } catch (error) {
      console.error("Error fetching accidents:", error);
    }
  };

  const fetchFatalities = async () => {
    try {
      const response = await fetch("/api/fatalities");
      if (!response.ok) {
        throw new Error("Failed to fetch fatalities data");
      }
      const data = await response.json();
      setFatalities(data);
    } catch (error) {
      console.error("Error fetching fatalities:", error);
    }
  };

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

    setTimeout(() => {
      const stationElement = stationRefs.current.get(station.name);
      if (stationElement && sidebarRef.current) {
        stationElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
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

  const isInBoston = (lat: number, lng: number): boolean => {
    const bostonBounds = {
      north: 42.4,
      south: 42.2,
      east: -70.9,
      west: -71.2,
    };

    return (
      lat >= bostonBounds.south &&
      lat <= bostonBounds.north &&
      lng >= bostonBounds.west &&
      lng <= bostonBounds.east
    );
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

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }

    fetchStations();
    fetchAccidents();
    fetchFatalities();
  }, []);

  useEffect(() => {
    if (searchLocation) {
      if (!isInBoston(searchLocation.lat, searchLocation.lng)) {
        setShowNoStationsPopup(true);
        setTimeout(() => setShowNoStationsPopup(false), 5000);
        return;
      }

      const nearbyStations = stations
        .filter((station) => {
          const distance = calculateDistance(
            searchLocation.lat,
            searchLocation.lng,
            parseFloat(station.latitude.toString()),
            parseFloat(station.longitude.toString())
          );
          return distance <= 0.5;
        })
        .map((station) => {
          const nearbyAccidents = accidents.filter((accident) => {
            const distance = calculateDistance(
              parseFloat(station.latitude.toString()),
              parseFloat(station.longitude.toString()),
              accident.latitude,
              accident.longitude
            );
            return distance <= 0.1;
          }).length;

          const nearbyFatalities = fatalities.filter((fatality) => {
            const distance = calculateDistance(
              parseFloat(station.latitude.toString()),
              parseFloat(station.longitude.toString()),
              fatality.latitude,
              fatality.longitude
            );
            return distance <= 0.3;
          }).length;

          const safetyScore = calculateSafetyScore(nearbyAccidents, nearbyFatalities);

          return {
            ...station,
            nearbyAccidents,
            nearbyFatalities,
            safetyScore,
          };
        });

      setFilteredStations(nearbyStations);

      if (nearbyStations.length === 0) {
        setShowNoStationsPopup(true);
        setTimeout(() => setShowNoStationsPopup(false), 5000);
      }

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

        const safest = nearbyStations.reduce((prev, curr) => {
          const prevScore = prev.safetyScore || 0;
          const currScore = curr.safetyScore || 0;
          return currScore > prevScore ? curr : prev;
        });
        setSafestStation(safest);
      } else {
        setClosestStation(null);
        setSafestStation(null);
      }
    } else {
      setFilteredStations([]);
      setClosestStation(null);
      setSafestStation(null);
      setSelectedStation(null);
      setDirections(null);
    }
  }, [searchLocation, stations, accidents]);

  useEffect(() => {
    if (map && searchLocation && !directionsService.current) {
      directionsService.current = new google.maps.DirectionsService();
    }
  }, [map, searchLocation]);

  useEffect(() => {
    if (isDarkMode) {
      const style = document.createElement("style");
      style.innerHTML = `
        .pac-container {
          background-color: #1f2937 !important;
          color: #f3f4f6 !important;
          border-color: #374151 !important;
        }
        .pac-item {
          background-color: #1f2937 !important;
          color: #f3f4f6 !important;
          border-color: #374151 !important;
        }
        .pac-item:hover {
          background-color: #374151 !important;
        }
        .pac-item-query {
          color: #f3f4f6 !important;
        }
        .pac-matched {
          color: #60a5fa !important;
        }
      `;
      document.head.appendChild(style);

      return () => {
        document.head.removeChild(style);
      };
    }
  }, [isDarkMode]);

  return (
    <LoadScript
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
      libraries={["places"]}
    >
      <div
        className={`min-h-screen ${
          isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
        }`}
      >
        <Navigation />

        {showNoStationsPopup && (
          <div
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
              isDarkMode ? "bg-red-800 text-white" : "bg-red-100 text-red-800"
            }`}
          >
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">
                Address not in Boston or no stations nearby
              </span>
            </div>
            <button
              onClick={() => setShowNoStationsPopup(false)}
              className={`mt-2 text-sm ${
                isDarkMode
                  ? "text-red-200 hover:text-white"
                  : "text-red-600 hover:text-red-800"
              }`}
            >
              Dismiss
            </button>
          </div>
        )}

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <div className="mx-auto">
              <Autocomplete
                onLoad={setSearchBox}
                onPlaceChanged={onPlaceChanged}
              >
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Enter an address in Boston"
                  className={`${
                    isDarkMode
                      ? "bg-gray-700 text-white border-gray-600 focus:ring-blue-400 placeholder-gray-400"
                      : "bg-white text-black border-gray-300 focus:ring-blue-400 placeholder-gray-500"
                  } w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:border-transparent shadow-sm`}
                  autoFocus
                />
              </Autocomplete>
            </div>
          </div>

          <div className="flex gap-4 transition-all">
            <div
              className={`${
                isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
              } rounded-xl shadow-lg p-4 transition-all ${
                isSidebarOpen ? "w-90" : "w-12"
              }`}
            >
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`mb-4 ${
                  isDarkMode
                    ? "text-gray-300 hover:text-white"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {isSidebarOpen ? "←" : "→"}
              </button>

              {isSidebarOpen && (
                <div ref={sidebarRef}>
                  <h2
                    className={`text-xl font-semibold mb-4 ${
                      isDarkMode ? "text-white" : "text-black"
                    }`}
                  >
                    Nearby Stations
                  </h2>
                  {searchLocation && (
                    <div
                      className={`mb-4 p-3 rounded-lg ${
                        isDarkMode
                          ? "bg-blue-900 text-white"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                        <span className="font-medium">Your Location</span>
                      </div>
                      <p className="text-sm mt-1">
                        {searchLocation.lat.toFixed(4)},{" "}
                        {searchLocation.lng.toFixed(4)}
                      </p>
                    </div>
                  )}
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

                      const safetyColor =
                        station.safetyScore !== undefined
                          ? getSafetyColor(station.safetyScore)
                          : "rgb(128, 128, 0)";

                      return (
                        <div
                          key={index}
                          ref={(el) => {
                            if (el) {
                              stationRefs.current.set(station.name, el);
                            }
                          }}
                          className={`p-4 rounded-lg cursor-pointer transition-colors ${
                            selectedStation === station
                              ? isDarkMode
                                ? "bg-gray-700 border border-gray-600"
                                : "bg-blue-50 border border-blue-200"
                              : isDarkMode
                              ? "hover:bg-gray-700 border border-gray-700"
                              : "hover:bg-gray-50 border border-gray-100"
                          }`}
                          onClick={() => handleStationClick(station)}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h3
                              className={`font-medium ${
                                isDarkMode ? "text-white" : "text-gray-900"
                              }`}
                              style={{ color: safetyColor }}
                            >
                              {station.name}
                            </h3>
                            <span
                              className={`text-sm font-medium ml-2 min-w-[55px] ${
                                isDarkMode ? "text-gray-300" : "text-gray-600"
                              }`}
                            >
                              {distance.toFixed(2)} mi
                            </span>
                          </div>
                          <div className="mt-2 flex items-center gap-3">
                            {station === closestStation && (
                              <span
                                className={`inline-block text-xs font-medium px-2 py-1 rounded ${
                                  isDarkMode
                                    ? "bg-blue-900 text-blue-200"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                Closest Station
                              </span>
                            )}
                            {station === safestStation && (
                              <span
                                className={`inline-block text-xs font-medium px-2 py-1 rounded ${
                                  isDarkMode
                                    ? "bg-green-900 text-green-200"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                Safest Station
                              </span>
                            )}
                          </div>
                          {selectedStation === station && (
                            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                              <div className="flex items-center justify-between mb-2">
                                <span
                                  className={`text-sm font-medium ${
                                    isDarkMode
                                      ? "text-gray-300"
                                      : "text-gray-600"
                                  }`}
                                >
                                  Safety Rating:
                                </span>
                                <span
                                  className={`text-sm font-bold ${
                                    isDarkMode ? "text-white" : "text-gray-900"
                                  }`}
                                >
                                  {station.safetyScore !== undefined
                                    ? (station.safetyScore * 10).toFixed(1) +
                                      "/10"
                                    : "N/A"}
                                </span>
                              </div>
                              <div
                                className={`w-full rounded-full h-3 mb-2
                                ${isDarkMode ? "bg-gray-200" : "bg-gray-700"}`}
                              >
                                <div
                                  className={`h-3 rounded-full ${
                                    station.safetyScore !== undefined
                                      ? getSafetyColor(station.safetyScore)
                                      : "bg-red-500"
                                  }`}
                                  style={{
                                    backgroundColor:
                                      station.safetyScore !== undefined
                                        ? getSafetyColor(station.safetyScore)
                                        : "red",
                                    width: `${
                                      station.safetyScore !== undefined
                                        ? station.safetyScore * 100
                                        : 0
                                    }%`,
                                  }}
                                ></div>
                              </div>
                              <span
                                className={`text-sm font-medium ${
                                  isDarkMode ? "text-gray-300" : "text-gray-600"
                                }`}
                              >
                                {station.nearbyAccidents} accidents within 0.1
                                mi
                              </span>
                              <br />
                              <span
                                className={`text-sm font-medium ${
                                  isDarkMode ? "text-gray-300" : "text-gray-600"
                                }`}
                              >
                                {station.nearbyFatalities} fatalities within 0.3
                                mi
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div
              className={`flex-1 ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } rounded-xl shadow-lg p-4 h-[calc(100vh-300px)]`}
            >
              <div className="w-full h-full rounded-lg overflow-hidden">
                <GoogleMap
                  mapContainerClassName="w-full h-full rounded-lg"
                  center={center}
                  zoom={13}
                  onLoad={(map) => setMap(map)}
                  options={{
                    styles: isDarkMode ? chartStyles : [],
                  }}
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
                        url: getMarkerIcon(station.safetyScore),
                        scaledSize: new google.maps.Size(32, 32),
                      }}
                    />
                  ))}
                  {searchLocation && (
                    <Marker
                      position={{
                        lat: searchLocation.lat,
                        lng: searchLocation.lng,
                      }}
                      title="Your Location"
                      icon={{
                        url: getUserLocationMarkerIcon(),
                        scaledSize: new google.maps.Size(40, 40),
                      }}
                    />
                  )}
                  {directions && (
                    <DirectionsRenderer
                      directions={directions}
                      options={{
                        suppressMarkers: true,
                      }}
                    />
                  )}
                </GoogleMap>
              </div>
            </div>
          </div>
        </main>
      </div>
    </LoadScript>
  );
}
