import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import type { Hospital, HospitalFinderResponse } from "@/types/hospital"
import { clientIp, rateLimit } from "@/lib/rate-limit"
import { getRequestId, logError, withTiming } from "@/lib/observability"

// ── Schema ──────────────────────────────────────────────────────────────────
const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(500).max(20_000).default(5000), // metres
})

// ── In-memory cache (server process lifetime) ───────────────────────────────
interface CacheEntry {
  data: HospitalFinderResponse
  expiresAt: number
}
const cache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

function roundCoord(v: number, dp = 2) {
  // ~1.1 km grid at dp=2 — good balance for cache granularity
  return parseFloat(v.toFixed(dp))
}

function cacheKey(lat: number, lon: number, radius: number) {
  return `${roundCoord(lat)}_${roundCoord(lon)}_${radius}`
}

function getCache(key: string): HospitalFinderResponse | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) { cache.delete(key); return null }
  return entry.data
}

function setCache(key: string, data: HospitalFinderResponse) {
  // Evict if cache is too large (> 200 entries)
  if (cache.size > 200) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].expiresAt - b[1].expiresAt)[0]
    if (oldest) cache.delete(oldest[0])
  }
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS })
}

// ── Haversine distance (km) ─────────────────────────────────────────────────
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ── Overpass API fetch ──────────────────────────────────────────────────────
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.ru/api/interpreter",
]

async function fetchFromOverpass(query: string, timeout = 25_000): Promise<any> {
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const controller = new AbortController()
      const id = setTimeout(() => controller.abort(), timeout)

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal,
      })
      clearTimeout(id)

      if (!res.ok) continue
      const json = await res.json()
      if (json?.elements) return json
    } catch {
      // Try next endpoint
    }
  }
  throw new Error("All Overpass endpoints failed")
}

// ── Parse OSM element → Hospital ────────────────────────────────────────────
function parseElement(el: any, userLat: number, userLon: number): Hospital | null {
  const tags: Record<string, string> = el.tags || {}

  // Coordinates: node → el.lat/lon, way|relation → el.center.lat/lon
  const lat: number | undefined = el.lat ?? el.center?.lat
  const lon: number | undefined = el.lon ?? el.center?.lon
  if (lat === undefined || lon === undefined) return null

  const name = tags.name || tags["name:en"] || tags["name:hi"] || "Unnamed Hospital"
  const distance = parseFloat(haversine(userLat, userLon, lat, lon).toFixed(2))

  // Build a readable address from available OSM fields
  const addressParts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:suburb"],
    tags["addr:city"] || tags.city,
    tags["addr:district"],
    tags["addr:state"],
  ].filter(Boolean)

  const address = addressParts.length > 0
    ? addressParts.join(", ")
    : tags["addr:full"] || tags.description || ""

  const phone = tags.phone || tags["contact:phone"] || tags["phone:IN"] || null
  const website = tags.website || tags["contact:website"] || null
  const emergency = tags.emergency === "yes" || tags.healthcare === "hospital"
  const beds = tags.beds ? parseInt(tags.beds, 10) || null : null
  const operator = tags.operator || tags["operator:type"] || null
  const openingHours = tags.opening_hours || null
  const wheelchair = tags.wheelchair === "yes"
    ? true
    : tags.wheelchair === "no"
      ? false
      : null

  return {
    id: `${el.type}/${el.id}`,
    name,
    lat,
    lon,
    distance,
    address,
    phone,
    website,
    emergency,
    beds,
    operator,
    openingHours,
    wheelchair,
    tags,
  }
}

// ── GET /api/hospital-finder?lat=&lon=&radius= ──────────────────────────────
export async function GET(req: NextRequest) {
  const requestId = getRequestId(req)

  // Rate limit: 30 requests/min per IP
  const rl = await rateLimit(`hospital-finder:${clientIp(req)}`, 30, 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment.", requestId },
      { status: 429 }
    )
  }

  // Validate query params
  const { searchParams } = new URL(req.url)
  const parsed = querySchema.safeParse({
    lat: searchParams.get("lat"),
    lon: searchParams.get("lon"),
    radius: searchParams.get("radius") ?? 5000,
  })

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid parameters: lat, lon (required) and optional radius (500–20000 m)", requestId },
      { status: 400 }
    )
  }

  const { lat, lon, radius } = parsed.data
  const key = cacheKey(lat, lon, radius)

  // Cache hit
  const cached = getCache(key)
  if (cached) {
    return NextResponse.json({ ...cached, source: "cache" }, {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
        "X-Cache": "HIT",
        "X-Request-Id": requestId,
      },
    })
  }

  // Build Overpass QL: hospitals, clinics, and healthcare nodes within radius
  const overpassQL = `
[out:json][timeout:25];
(
  node["amenity"="hospital"](around:${radius},${lat},${lon});
  way["amenity"="hospital"](around:${radius},${lat},${lon});
  relation["amenity"="hospital"](around:${radius},${lat},${lon});
  node["amenity"="clinic"](around:${radius},${lat},${lon});
  way["amenity"="clinic"](around:${radius},${lat},${lon});
  node["healthcare"="hospital"](around:${radius},${lat},${lon});
  way["healthcare"="hospital"](around:${radius},${lat},${lon});
  node["healthcare"="clinic"](around:${radius},${lat},${lon});
);
out center tags;
`.trim()

  try {
    const overpassData = await withTiming("hospital-finder.overpass", () =>
      fetchFromOverpass(overpassQL)
    )

    const hospitals: Hospital[] = (overpassData.elements as any[])
      .map((el) => parseElement(el, lat, lon))
      .filter((h): h is Hospital => h !== null)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 50) // cap at 50 results

    const payload: HospitalFinderResponse = {
      hospitals,
      total: hospitals.length,
      userLat: lat,
      userLon: lon,
      radiusKm: radius / 1000,
      cachedAt: new Date().toISOString(),
      source: "api",
    }

    setCache(key, payload)

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
        "X-Cache": "MISS",
        "X-Request-Id": requestId,
      },
    })
  } catch (error) {
    logError("hospital-finder.fetch.failed", {
      requestId,
      lat, lon, radius,
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(
      { error: "Unable to fetch hospital data. Please try again shortly.", requestId },
      { status: 503 }
    )
  }
}
