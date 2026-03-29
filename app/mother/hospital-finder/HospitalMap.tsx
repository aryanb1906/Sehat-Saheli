"use client"

import { useEffect, useRef, useState } from "react"
import type { Hospital, UserLocation } from "@/types/hospital"

interface Props {
  userLocation: UserLocation
  hospitals: Hospital[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export default function HospitalMap({ userLocation, hospitals, selectedId, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const leafletRef = useRef<any>(null)
  const markersRef = useRef<Map<string, any>>(new Map())
  const initializedRef = useRef(false) // guard against StrictMode double-invoke
  const [isMapReady, setIsMapReady] = useState(false)

  // ── Effect 1: Initialize map ONCE per mount ──────────────────────────
  useEffect(() => {
    if (initializedRef.current || !containerRef.current) return
    initializedRef.current = true

    let cancelled = false

    ;(async () => {
      const { default: L } = await import("leaflet")
      if (cancelled || !containerRef.current) return

      leafletRef.current = L

      // Fix broken webpack icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      const map = L.map(containerRef.current, {
        center: [userLocation.lat, userLocation.lon],
        zoom: 14,
        zoomControl: true,
        attributionControl: true,
      })
      mapRef.current = map

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      const userIcon = L.divIcon({
        className: "",
        html: `
          <div style="position:relative;width:24px;height:24px;">
            <div style="position:absolute;inset:0;border-radius:50%;background:#16a34a;opacity:0.25;animation:osm-ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="position:absolute;inset:4px;border-radius:50%;background:#16a34a;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3);"></div>
          </div>
          <style>@keyframes osm-ping{75%,100%{transform:scale(2.2);opacity:0}}</style>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })
      L.marker([userLocation.lat, userLocation.lon], { icon: userIcon, zIndexOffset: 1000 })
        .addTo(map)
        .bindPopup("<b>📍 Your Location</b>")
        
      setIsMapReady(true)
    })()

    return () => {
      cancelled = true
      // Always reset guard — even if async init hadn't finished yet
      initializedRef.current = false
      setIsMapReady(false)
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
      markersRef.current.clear()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // ← intentionally empty: map is created once per mount

  // ── Effect 2: Pan map when location changes (no re-init) ─────────────
  useEffect(() => {
    if (!isMapReady || !mapRef.current) return
    mapRef.current.setView([userLocation.lat, userLocation.lon], 14, { animate: true })
  }, [userLocation.lat, userLocation.lon, isMapReady])

  // ── Effect 3: Add/replace hospital markers when data changes ──────────
  useEffect(() => {
    if (!isMapReady) return
    const map = mapRef.current
    const L = leafletRef.current
    if (!map || !L) return

    // Remove old markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current.clear()

    hospitals.forEach((h) => {
      const color = h.emergency ? "#ef4444" : "#059669"
      const icon = L.divIcon({
        className: "",
        html: `
          <div style="
            width:44px;height:44px;border-radius:50% 50% 50% 0;
            background:${color};border:3px solid white;
            transform:rotate(-45deg);
            box-shadow:0 4px 12px rgba(0,0,0,.3);
            display:flex;align-items:center;justify-content:center;
          ">
            <span style="transform:rotate(45deg);font-size:22px;">🏥</span>
          </div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 44],
        popupAnchor: [0, -46],
      })

      const popup = `
        <div style="min-width:180px;font-family:system-ui,sans-serif;">
          <p style="font-weight:700;font-size:14px;margin:0 0 4px">${h.name}</p>
          ${h.address ? `<p style="font-size:12px;color:#666;margin:0 0 4px">📍 ${h.address}</p>` : ""}
          <p style="font-size:12px;color:#059669;margin:0 0 4px;font-weight:600">${h.distance} km away</p>
          ${h.emergency ? `<span style="background:#fef2f2;color:#ef4444;padding:2px 6px;border-radius:9999px;font-size:11px;font-weight:600;">🚨 Emergency</span>` : ""}
          ${h.phone ? `<br><a href="tel:${h.phone}" style="font-size:12px;color:#2563eb;margin-top:4px;display:block">📞 ${h.phone}</a>` : ""}
        </div>`

      const marker = L.marker([h.lat, h.lon], { icon })
        .addTo(map)
        .bindPopup(popup)
        .on("click", () => onSelect(h.id))

      markersRef.current.set(h.id, marker)
    })
  }, [hospitals, onSelect, isMapReady])

  // ── Effect 4: Fly to selected hospital ───────────────────────────────
  useEffect(() => {
    if (!isMapReady || !mapRef.current || !selectedId) return
    const marker = markersRef.current.get(selectedId)
    const hospital = hospitals.find((h) => h.id === selectedId)
    if (marker && hospital) {
      mapRef.current.flyTo([hospital.lat, hospital.lon], 16, { duration: 0.8 })
      setTimeout(() => marker.openPopup(), 850)
    }
  }, [selectedId, hospitals, isMapReady])

  return (
    <div
      ref={containerRef}
      className="w-full rounded-2xl overflow-hidden border border-border shadow-sm relative z-0 isolate"
      style={{ height: 380 }}
      aria-label="Hospitals map"
    />
  )
}
