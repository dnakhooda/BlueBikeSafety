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

export const calculateSafetyScore = (accidents: number): number => {
  if (accidents === 0) return 1.0;
  if (accidents === 2) return 0.9;
  if (accidents <= 4) return 0.8;
  if (accidents <= 6) return 0.7;
  if (accidents <= 8) return 0.6;
  if (accidents <= 10) return 0.4;
  if (accidents <= 12) return 0.3;
  if (accidents <= 14) return 0.2;
  return 0;
};

export const getSafetyColor = (score: number): string => {
  const red = Math.round(205 * (1 - score) + 25);
  const green = Math.round(205 * score + 25);
  return `rgb(${red}, ${green}, 0)`;
};
