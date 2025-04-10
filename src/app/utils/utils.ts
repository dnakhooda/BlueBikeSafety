export const calculateSafetyScore = (
  accidents: number,
  fatalities: number,
  recentAccidents: number
): number => {
  const log = (x: number) => Math.log(x + 1);

  const accidentWeight = log(accidents);
  const recentAccidentWeight = log(recentAccidents);

  const danger = accidentWeight * 0.7 + recentAccidentWeight * 0.3;

  let score = 1 / (1 + danger);

  if (fatalities > 0)
    score *= 0.5;

  if (recentAccidents === 0 && fatalities === 0)
    score += 0.05;

  return Math.max(0, Math.min(score, 1));
};

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
