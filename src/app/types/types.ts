export interface BlueBikeStation {
  name: string;
  latitude: number;
  longitude: number;
  nearbyAccidents?: number;
  safetyScore?: number;
}

export interface Accident {
  latitude: number;
  longitude: number;
}
