import { NextResponse } from 'next/server'

type CacheEntry = {
  ts: number
  data: any
}

const cache = new Map<string, CacheEntry>()
const TTL = 1000 * 60 * 60 // 1 hour

function cacheKey(query: string, radius: number) {
  return `${query}::${radius}`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const query = String(body.query || '')
    const radius = Number(body.radius || 5000)

    if (!query) return NextResponse.json({ error: 'Missing query' }, { status: 400 })

    const key = cacheKey(query, radius)
    const entry = cache.get(key)
    const now = Date.now()
    if (entry && now - entry.ts < TTL) {
      return NextResponse.json(entry.data)
    }

    // 1) Geocode with Nominatim
    const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`
    const nomRes = await fetch(nomUrl, {
      headers: {
        'User-Agent': 'Sehat-Saheli/1.0 (https://example.com)',
      },
    })
    if (!nomRes.ok) throw new Error('Failed to geocode location')
    const places = await nomRes.json()
    if (!places || places.length === 0) throw new Error('Location not found')

    const lat = parseFloat(places[0].lat)
    const lon = parseFloat(places[0].lon)

    // 2) Query Overpass for hospitals around lat/lon
    const overpassQL = `[out:json][timeout:25];(node["amenity"="hospital"](around:${radius},${lat},${lon});way["amenity"="hospital"](around:${radius},${lat},${lon});relation["amenity"="hospital"](around:${radius},${lat},${lon}););out center;`;
    const overpassUrl = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(overpassQL)
    const ovRes = await fetch(overpassUrl)
    if (!ovRes.ok) throw new Error('Failed to fetch hospitals')
    const ovJson = await ovRes.json()

    const items = (ovJson.elements || []).map((el: any) => {
      const elLat = el.type === 'node' ? el.lat : el.center?.lat
      const elLon = el.type === 'node' ? el.lon : el.center?.lon
      const address = [el.tags?.['addr:street'], el.tags?.['addr:housenumber'], el.tags?.village, el.tags?.city]
        .filter(Boolean)
        .join(', ')

      return {
        id: `${el.type}/${el.id}`,
        name: el.tags?.name || 'Unnamed Hospital',
        phone: el.tags?.phone || el.tags?.['contact:phone'] || null,
        address: address || null,
        tags: el.tags || {},
        lat: elLat,
        lon: elLon,
      }
    }).slice(0, 200)

    const result = {
      center: { lat, lon },
      hospitals: items,
    }

    cache.set(key, { ts: now, data: result })

    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
