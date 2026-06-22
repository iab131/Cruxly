export type Coordinates = {
  latitude: number
  longitude: number
}

const EARTH_RADIUS_KILOMETERS = 6371

function toRadians(value: number) {
  return (value * Math.PI) / 180
}

export function getDistanceInKilometers(from: Coordinates, to: Coordinates) {
  const latDelta = toRadians(to.latitude - from.latitude)
  const lngDelta = toRadians(to.longitude - from.longitude)
  const fromLat = toRadians(from.latitude)
  const toLat = toRadians(to.latitude)

  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(lngDelta / 2) ** 2

  return EARTH_RADIUS_KILOMETERS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function formatDistanceKilometers(distance: number) {
  if (distance < 0.1) return "less than 0.1 km"
  if (distance < 10) return `${distance.toFixed(1)} km`
  return `${Math.round(distance)} km`
}
