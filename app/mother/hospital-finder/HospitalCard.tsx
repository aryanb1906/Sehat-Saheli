"use client"

import type { Hospital } from "@/types/hospital"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  MapPin, Phone, Globe, Clock, Accessibility,
  BedDouble, Building2, AlertTriangle, Navigation,
  ChevronRight,
} from "lucide-react"

interface Props {
  hospital: Hospital
  index: number
  isSelected: boolean
  onSelect: () => void
}

export default function HospitalCard({ hospital, index, isSelected, onSelect }: Props) {
  const distanceLabel =
    hospital.distance < 1
      ? `${Math.round(hospital.distance * 1000)} m`
      : `${hospital.distance.toFixed(1)} km`

  return (
    <Card
      onClick={onSelect}
      className={`p-4 cursor-pointer border-2 transition-all duration-200 hover:shadow-md animate-fade-up ${
        isSelected
          ? "border-success shadow-md shadow-success/10 bg-success/5"
          : "border-border hover:border-success/40"
      }`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-lg">🏥</span>
            <h3 className="font-bold text-base leading-tight truncate">{hospital.name}</h3>
          </div>

          {/* Badges row */}
          <div className="flex flex-wrap gap-1.5 mt-1">
            {hospital.emergency && (
              <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs font-semibold gap-1">
                <AlertTriangle className="w-3 h-3" />
                Emergency
              </Badge>
            )}
            {hospital.beds !== null && (
              <Badge variant="outline" className="text-xs gap-1">
                <BedDouble className="w-3 h-3" />
                {hospital.beds} beds
              </Badge>
            )}
            {hospital.wheelchair === true && (
              <Badge variant="outline" className="text-xs gap-1">
                <Accessibility className="w-3 h-3" />
                Accessible
              </Badge>
            )}
          </div>
        </div>

        {/* Distance badge */}
        <div className="flex-shrink-0 text-right">
          <div className="inline-flex items-center gap-1 bg-success/10 text-success px-2.5 py-1 rounded-full">
            <Navigation className="w-3.5 h-3.5" />
            <span className="text-sm font-bold whitespace-nowrap">{distanceLabel}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">away</p>
        </div>
      </div>

      {/* Address */}
      {hospital.address && (
        <p className="text-sm text-muted-foreground flex items-start gap-1.5 mb-2 leading-relaxed">
          <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-success" />
          <span className="line-clamp-2">{hospital.address}</span>
        </p>
      )}

      {/* Operator */}
      {hospital.operator && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
          <Building2 className="w-3.5 h-3.5 shrink-0" />
          {hospital.operator}
        </p>
      )}

      {/* Opening hours */}
      {hospital.openingHours && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          {hospital.openingHours}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 mt-3 flex-wrap">
        {hospital.phone ? (
          <Button
            size="sm"
            className="flex-1 bg-success hover:bg-success/90 text-white gap-2 min-w-[120px]"
            onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${hospital.phone}` }}
          >
            <Phone className="w-4 h-4" />
            Call Now
          </Button>
        ) : (
          <Button size="sm" variant="outline" className="flex-1 gap-2 min-w-[120px]" disabled>
            <Phone className="w-4 h-4" />
            No Phone
          </Button>
        )}

        {hospital.website ? (
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={(e) => {
              e.stopPropagation()
              window.open(hospital.website!, "_blank", "noopener,noreferrer")
            }}
          >
            <Globe className="w-4 h-4" />
            Website
          </Button>
        ) : null}

        <Button
          size="sm"
          variant="ghost"
          className="gap-1 ml-auto text-success"
          onClick={(e) => {
            e.stopPropagation()
            window.open(
              `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${hospital.lat},${hospital.lon}`,
              "_blank",
              "noopener,noreferrer"
            )
          }}
        >
          Directions
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  )
}
