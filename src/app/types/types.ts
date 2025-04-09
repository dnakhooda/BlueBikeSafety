export interface BlueBikeStation {
  name: string;
  latitude: number;
  longitude: number;
  nearbyAccidents?: number;
  nearbyFatalities?: number;
  safetyScore?: number;
}

export interface Accident {
  latitude: number;
  longitude: number;
}

export interface Fatality {
  latitude: number;
  longitude: number;
}
