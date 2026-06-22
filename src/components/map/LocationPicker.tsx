"use client"

import { useEffect, useMemo, useState } from "react"
import { Crosshair, Loader2, MapPin, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPreview } from "@/components/map/MapPreview"

type LocationValue = {
  gym: string
  locationAddress: string
  latitude: string
  longitude: string
  placeId: string
}

type GeoapifyFeature = {
  properties: {
    name?: string
    address_line1?: string
    formatted?: string
    lat?: number
    lon?: number
    place_id?: string
    categories?: string[]
  }
}

type SearchBias = {
  latitude: number
  longitude: number
}

const emptyLocation: LocationValue = {
  gym: "",
  locationAddress: "",
  latitude: "",
  longitude: "",
  placeId: "",
}

const DEFAULT_SEARCH_BIAS: SearchBias = {
  latitude: 43.7764,
  longitude: -79.2318,
}

const GYM_KEYWORDS = ["climbing", "bouldering", "rock climbing", "climb", "gym", "fitness", "sports"]
const PREFERRED_GYM_KEYWORDS = ["climbing", "bouldering", "climb"]

function getSearchableText(feature: GeoapifyFeature) {
  const properties = feature.properties
  return [
    properties.name,
    properties.address_line1,
    properties.formatted,
    ...(properties.categories || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
}

function isLikelyGym(feature: GeoapifyFeature) {
  const text = getSearchableText(feature)
  return GYM_KEYWORDS.some((keyword) => text.includes(keyword))
}

function getGymScore(feature: GeoapifyFeature) {
  const name = (feature.properties.name || "").toLowerCase()
  const text = getSearchableText(feature)
  const preferredNameHits = PREFERRED_GYM_KEYWORDS.filter((keyword) => name.includes(keyword)).length
  const preferredTextHits = PREFERRED_GYM_KEYWORDS.filter((keyword) => text.includes(keyword)).length
  const generalHits = GYM_KEYWORDS.filter((keyword) => text.includes(keyword)).length

  return preferredNameHits * 10 + preferredTextHits * 4 + generalHits
}

export function LocationPicker() {
  const geoapifyApiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || ""
  const [location, setLocation] = useState<LocationValue>(emptyLocation)
  const [suggestions, setSuggestions] = useState<GeoapifyFeature[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false)
  const [searchBias, setSearchBias] = useState<SearchBias>(DEFAULT_SEARCH_BIAS)

  const canAutocomplete = Boolean(geoapifyApiKey)
  const searchText = location.gym.trim()

  useEffect(() => {
    if (!canAutocomplete || !navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSearchBias({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      () => undefined,
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 1000 * 60 * 15 }
    )
  }, [canAutocomplete])

  useEffect(() => {
    if (!canAutocomplete || searchText.length < 3) {
      setSuggestions([])
      setIsSearching(false)
      return
    }

    const controller = new AbortController()
    const timeout = window.setTimeout(async () => {
      setIsSearching(true)

      try {
        const query = PREFERRED_GYM_KEYWORDS.some((keyword) => searchText.toLowerCase().includes(keyword))
          ? searchText
          : `${searchText} climbing gym`
        const params = new URLSearchParams({
          text: query,
          limit: "10",
          type: "amenity",
          bias: `proximity:${searchBias.longitude},${searchBias.latitude}`,
          apiKey: geoapifyApiKey,
        })
        const response = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?${params}`, {
          signal: controller.signal,
        })

        if (!response.ok) throw new Error("Geoapify autocomplete failed")

        const data = (await response.json()) as { features?: GeoapifyFeature[] }
        const gymResults = (data.features || [])
          .filter(isLikelyGym)
          .sort((a, b) => getGymScore(b) - getGymScore(a))
          .slice(0, 6)

        setSuggestions(gymResults)
        setIsSuggestionOpen(true)
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setSuggestions([])
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false)
        }
      }
    }, 350)

    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [canAutocomplete, geoapifyApiKey, searchBias.latitude, searchBias.longitude, searchText])

  const helperText = useMemo(() => {
    if (canAutocomplete) return "Showing likely climbing, bouldering, sports, fitness, or gym results near you."
    return "No Geoapify key found. Enter the gym manually and add coordinates to show map pins and distance."
  }, [canAutocomplete])

  const previewLatitude = location.latitude ? Number(location.latitude) : null
  const previewLongitude = location.longitude ? Number(location.longitude) : null
  const hasPreviewCoordinates =
    typeof previewLatitude === "number" &&
    typeof previewLongitude === "number" &&
    !Number.isNaN(previewLatitude) &&
    !Number.isNaN(previewLongitude)

  function selectSuggestion(feature: GeoapifyFeature) {
    const properties = feature.properties
    const formatted = properties.formatted || ""

    setLocation({
      gym: properties.name || properties.address_line1 || formatted,
      locationAddress: formatted,
      latitude: typeof properties.lat === "number" ? String(properties.lat) : "",
      longitude: typeof properties.lon === "number" ? String(properties.lon) : "",
      placeId: properties.place_id || "",
    })
    setSuggestions([])
    setIsSuggestionOpen(false)
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) return

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation((current) => ({
          ...current,
          latitude: String(position.coords.latitude),
          longitude: String(position.coords.longitude),
          placeId: "",
        }))
        setIsLocating(false)
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 * 60 * 5 }
    )
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="gym">Search climbing gym or bouldering gym</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="gym"
            name="gym"
            placeholder={canAutocomplete ? "e.g. Hub Climbing, Boulder Parc, Joe Rockhead's" : "Gym name"}
            required
            className="bg-white pl-10 pr-10"
            value={location.gym}
            autoComplete="off"
            onFocus={() => setIsSuggestionOpen(true)}
            onChange={(event) =>
              setLocation((current) => ({
                ...current,
                gym: event.target.value,
                placeId: "",
              }))
            }
          />
          {canAutocomplete && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </div>
          )}

          {canAutocomplete && isSuggestionOpen && suggestions.length > 0 && (
            <div className="absolute z-30 mt-2 max-h-72 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-xl">
              {suggestions.map((feature) => {
                const properties = feature.properties
                const label = properties.name || properties.address_line1 || properties.formatted || "Unnamed location"

                return (
                  <button
                    key={`${properties.place_id || properties.formatted}-${properties.lat}-${properties.lon}`}
                    type="button"
                    className="w-full px-3 py-2 text-left hover:bg-slate-50"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectSuggestion(feature)}
                  >
                    <span className="block text-sm font-semibold text-slate-900">{label}</span>
                    {properties.formatted && (
                      <span className="block truncate text-xs text-slate-500">{properties.formatted}</span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
        <p className="text-xs text-slate-500">{helperText}</p>
      </div>

      <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Can&apos;t find your gym? Enter it manually.</h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <Input
            name="locationAddress"
            placeholder="Address"
            className="bg-white"
            value={location.locationAddress}
            onChange={(event) =>
              setLocation((current) => ({
                ...current,
                locationAddress: event.target.value,
                placeId: "",
              }))
            }
          />
          <Button type="button" variant="outline" onClick={useCurrentLocation} disabled={isLocating} className="shrink-0">
            <Crosshair className="h-4 w-4" />
            {isLocating ? "Locating..." : "Use my pin"}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            name="latitude"
            inputMode="decimal"
            placeholder="Latitude"
            className="bg-white"
            value={location.latitude}
            onChange={(event) =>
              setLocation((current) => ({
                ...current,
                latitude: event.target.value,
                placeId: "",
              }))
            }
          />
          <Input
            name="longitude"
            inputMode="decimal"
            placeholder="Longitude"
            className="bg-white"
            value={location.longitude}
            onChange={(event) =>
              setLocation((current) => ({
                ...current,
                longitude: event.target.value,
                placeId: "",
              }))
            }
          />
        </div>
      </div>

      {(hasPreviewCoordinates || location.locationAddress || location.gym) && (
        <MapPreview
          latitude={hasPreviewCoordinates ? previewLatitude : null}
          longitude={hasPreviewCoordinates ? previewLongitude : null}
          locationAddress={location.locationAddress}
          gymName={location.gym}
          className="h-[220px]"
        />
      )}

      <input type="hidden" name="placeId" value={location.placeId} />
    </div>
  )
}
