"use client"

import dynamic from "next/dynamic"
import { MapPin } from "lucide-react"

const LeafletMap = dynamic(() => import("./LeafletMap").then((mod) => mod.LeafletMap), {
  ssr: false,
  loading: () => <div className="h-full min-h-[220px] animate-pulse bg-slate-100" />,
})

type MapPreviewProps = {
  latitude?: number | null
  longitude?: number | null
  locationAddress?: string | null
  gymName?: string | null
  className?: string
}

export function MapPreview({ latitude, longitude, locationAddress, gymName, className }: MapPreviewProps) {
  const hasCoordinates = latitude != null && longitude != null

  if (hasCoordinates) {
    const osmUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`

    return (
      <div className={className}>
        <div className="h-full min-h-[220px] overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
          <LeafletMap
            latitude={latitude}
            longitude={longitude}
            gymName={gymName}
            locationAddress={locationAddress}
          />
        </div>
        <a
          href={osmUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex text-xs font-medium text-blue-700 hover:text-blue-900"
        >
          Open in OpenStreetMap
        </a>
      </div>
    )
  }

  if (locationAddress || gymName) {
    const query = encodeURIComponent(locationAddress || gymName || "")
    const osmSearchUrl = `https://www.openstreetmap.org/search?query=${query}`

    return (
      <div className={className}>
        <a
          href={osmSearchUrl}
          target="_blank"
          rel="noreferrer"
          className="flex h-full min-h-[220px] flex-col justify-end rounded-lg border border-slate-200 bg-[linear-gradient(135deg,#e0f2fe_0%,#f8fafc_55%,#dbeafe_100%)] p-5 transition-colors hover:border-blue-300"
        >
          <div className="space-y-2">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-950 text-white shadow-lg">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-slate-950">{gymName || "Open location"}</p>
              <p className="text-sm text-slate-600">{locationAddress || "Search this location in OpenStreetMap"}</p>
            </div>
          </div>
        </a>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex h-full min-h-[220px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
        <div className="max-w-xs space-y-2">
          <MapPin className="mx-auto h-8 w-8 text-slate-400" />
          <p className="text-sm font-semibold text-slate-700">No location added.</p>
        </div>
      </div>
    </div>
  )
}
