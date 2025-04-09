export interface BlueBikeStation {
  name: string;
  latitude: number;
  longitude: number;
  nearbyAccidents?: number;
  nearbyFatalities?: number;
  recentAccidents?: number;
  safetyScore?: number;
}

export interface Accident {
  latitude: number;
  longitude: number;
  time: string;
}

export interface Fatality {
  latitude: number;
  longitude: number;
}
