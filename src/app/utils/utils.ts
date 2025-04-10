export const calculateSafetyScore = (
  accidents: number,
  fatalities: number,
  recentAccidents: number
): number => {
  if (accidents === 0 && fatalities === 0)
    return 1;

  const accidentWeight = log(accidents, 6);
  const recentAccidentWeight = log(recentAccidents, 6);

  const danger = accidentWeight * 0.75 + recentAccidentWeight * 0.25;

  let score = 1 / (1 + danger);

  if (fatalities > 0)
    score *= 0.25;

  if (recentAccidents === 0)
    score += 0.1;

  return Math.max(0, Math.min(score, 1));
};

const log = (x: number, y:number) => Math.log(x + 1) / Math.log(y);

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

export const getSafetyColor = (score: number): string => {
  const red = Math.round(180 * (1 - score) + 25);
  const green = Math.round(180 * score + 25);
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
