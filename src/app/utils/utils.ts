export const calculateDistance = (
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

export const calculateSafetyScore = (accidents: number, fatalities: number): number => {
  let score = 0;
  if (accidents === 0) score = 1.0;
  if (accidents <= 2 && accidents > 0) score = 0.9;
  if (accidents <= 4 && accidents > 2) score = 0.8;
  if (accidents <= 6 && accidents > 4) score = 0.7;
  if (accidents <= 8 && accidents > 6) score = 0.6;
  if (accidents <= 10 && accidents > 8) score = 0.4;
  if (accidents <= 12 && accidents > 10) score = 0.3;
  if (accidents <= 14 && accidents > 12) score = 0.2;
  if (accidents <= 16 && accidents > 14) score = 0.1;

  if (fatalities > 0) score /= 2;
  return score;
};

export const getSafetyColor = (score: number): string => {
  const red = Math.round(155 * (1 - score) + 50);
  const green = Math.round(155 * score + 50);
  return `rgb(${red}, ${green}, 0)`;
};

export function getMarkerIcon(safetyScore: number | undefined): string {
  if (!safetyScore)
    return "http://maps.google.com/mapfiles/ms/icons/red-dot.png";

  if (safetyScore > 0.7) {
    return "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
  } else if (safetyScore > 0.4) {
    return "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
  } else {
    return "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
  }
}

export function getUserLocationMarkerIcon(): string {
  return "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
}
