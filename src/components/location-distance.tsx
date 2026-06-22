"use client"

import { useEffect, useMemo, useState } from "react"
import { Navigation } from "lucide-react"
import { formatDistanceKilometers, getDistanceInKilometers } from "@/lib/location"

type LocationDistanceProps = {
  latitude?: number | null
  longitude?: number | null
  className?: string
}

export function LocationDistance({ latitude, longitude, className }: LocationDistanceProps) {
  const [userPosition, setUserPosition] = useState<{ latitude: number; longitude: number } | null>(null)
  const [permissionDenied, setPermissionDenied] = useState(false)

  useEffect(() => {
    if (latitude == null || longitude == null || !navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setPermissionDenied(true)
        }
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 1000 * 60 * 10 }
    )
  }, [latitude, longitude])

  const distance = useMemo(() => {
    if (!userPosition || latitude == null || longitude == null) return null
    return getDistanceInKilometers(userPosition, { latitude, longitude })
  }, [latitude, longitude, userPosition])

  if (latitude == null || longitude == null) return null

  return (
    <span className={className}>
      <Navigation className="h-3.5 w-3.5" />
      {distance == null ? (permissionDenied ? "Distance unavailable" : "Calculating distance...") : `${formatDistanceKilometers(distance)} away`}
    </span>
  )
}
