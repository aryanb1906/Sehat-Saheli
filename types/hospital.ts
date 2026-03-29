export interface Hospital {
  id: string
  name: string
  lat: number
  lon: number
  distance: number            // km from user, server-computed (Haversine)
  address: string
  phone: string | null
  website: string | null
  emergency: boolean          // amenity=hospital with emergency tag
  beds: number | null
  operator: string | null
  openingHours: string | null
  wheelchair: boolean | null   // accessibility
  tags: Record<string, string> // raw OSM tags for future use
}

export interface HospitalFinderResponse {
  hospitals: Hospital[]
  total: number
  userLat: number
  userLon: number
  radiusKm: number
  cachedAt: string
  source: "api" | "cache" | "fallback"
}

export type LocationPermissionState =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "unavailable"

export interface UserLocation {
  lat: number
  lon: number
  accuracy: number // metres
}
