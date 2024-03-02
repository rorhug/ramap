"use client"

import * as React from "react"
import Map, { Marker, Popup } from "react-map-gl"
import { env } from "~/env"

import "mapbox-gl/dist/mapbox-gl.css"
import { type GeocodedVenue } from "../types"
import { VenueDrawer } from "./event-drawer"
import { useMemo, useState } from "react"

// 51.829608, -0.730951

// 51.167276, 0.395573

export default function VenueMap({
  venues,
  // setSelectedVenueId,
  // selectedVenueId,
}: {
  venues: GeocodedVenue[]
  // setSelectedVenueId: (id: number) => void
  // selectedVenueId: number | null
}) {
  const [selectedVenueId, setSelectedVenueId] = useState<number | null>(null)
  const selectedVenue = useMemo(() => {
    return venues.find((venue) => venue.id === selectedVenueId) ?? null
  }, [selectedVenueId, venues])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#221237] to-[#0a0015] text-white">
      <Map
        mapLib={import("mapbox-gl")}
        initialViewState={{
          longitude: -0.09,
          latitude: 51.5,
          zoom: 10,
        }}
        style={{ width: "100vw", height: "100vh" }}
        mapStyle="mapbox://styles/mapbox/streets-v9"
        mapboxAccessToken={env.NEXT_PUBLIC_MAPBOX_TOKEN}
      >
        {venues.map((venue) => {
          const { coordinates, inLondon } = venue

          if (!inLondon || !coordinates) {
            return null
          }

          return (
            <Marker
              key={venue.id}
              longitude={coordinates[0]}
              latitude={coordinates[1]}
              anchor="bottom"
              onClick={() => setSelectedVenueId(venue.id)}
            >
              <span
                className={`text-2xl ${selectedVenueId === venue.id ? "rounded-md bg-green-400 bg-opacity-60 p-2" : ""}`}
              >
                🏢
              </span>
            </Marker>
          )
        })}
      </Map>

      <VenueDrawer
        venue={selectedVenue}
        setSelectedVenueId={setSelectedVenueId}
      />
    </main>
  )
}
