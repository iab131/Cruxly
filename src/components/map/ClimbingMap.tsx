import { MapPreview } from "@/components/map/MapPreview"

type ClimbingMapProps = {
  latitude?: number | null
  longitude?: number | null
  name?: string
  gym?: string
  className?: string
}

export function ClimbingMap({ latitude, longitude, name, gym, className }: ClimbingMapProps) {
  return (
    <MapPreview
      latitude={latitude}
      longitude={longitude}
      gymName={name || gym}
      locationAddress={gym}
      className={className}
    />
  )
}
