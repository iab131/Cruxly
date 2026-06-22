"use client"

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"
import L from "leaflet"

type LeafletMapProps = {
  latitude: number
  longitude: number
  gymName?: string | null
  locationAddress?: string | null
}

const markerIcon = L.divIcon({
  className: "",
  html: '<div style="width:28px;height:28px;border-radius:9999px;background:#172554;border:3px solid white;box-shadow:0 10px 25px rgba(15,23,42,.25);"></div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

export function LeafletMap({ latitude, longitude, gymName, locationAddress }: LeafletMapProps) {
  const position: [number, number] = [latitude, longitude]

  return (
    <MapContainer center={position} zoom={14} scrollWheelZoom className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position} icon={markerIcon}>
        <Popup>
          <div className="space-y-1">
            <p className="font-semibold">{gymName || "Climb location"}</p>
            {locationAddress && <p>{locationAddress}</p>}
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  )
}
