"use server"

import { env } from "~/env"
import {
  type RaVenue,
  type GeocodedVenue,
  type GeocodeResponse,
  type AreaObject,
  MapboxContext,
} from "./types"
import { fetchArea, fetchEventsFromRa } from "./ra-api"
import { createClient } from "../supabase/client"
import type { Tables } from "../supabase/types"

import { cache } from "react"
import { createServerClient } from "~/supabase/server"

type VenueRow = Tables<"venues">

export type VenueData = {
  venues: GeocodedVenue[]
  medianPoint: [number, number]
  area: AreaObject
}

const fetchVenues = cache(
  async (date: Date, areaId: number): Promise<VenueData> => {
    const {
      data: { eventsArea: area },
    } = await fetchArea(areaId)

    const eventResponse = await fetchEventsFromRa(date, areaId)

    const listings = eventResponse.data.eventListings.data

    // const e = events[0]
    const venues = listings.reduce<RaVenue[]>((acc, listing) => {
      const { event } = listing
      const { venue } = event

      if (!venue) {
        return acc
      }

      const existing = acc.find((v) => v.id === venue.id)

      if (existing) {
        if (!existing.events) {
          existing.events = []
        } else {
          existing.events.push(event)
        }
      } else {
        acc.push({
          ...venue,
          events: [event],
        })
      }

      return acc
    }, [])

    const geocoded = await geocodeEvents(venues)

    const medianPoint = calculateMedianPoint(geocoded)

    return { venues: geocoded, medianPoint, area }
  },
)

export { fetchVenues }

async function geocodeEvents(venue: RaVenue[]): Promise<GeocodedVenue[]> {
  const supabase = createServerClient()
  const venueIds = venue.map((v) => v.id)

  // 1. Get all venue IDs from Supabase that match the input
  const { data: existingVenues, error } = await supabase
    .from("venues")
    .select("id, long, lat, mapbox_context, address, area_id, live, name")
    .in("id", venueIds)

  if (error) throw error

  const existingVenueMap = new Map<string, VenueRow>()
  if (existingVenues) {
    for (const v of existingVenues as VenueRow[]) {
      existingVenueMap.set(v.id, v)
    }
  }

  // 2. Find which venues are missing
  const missingVenues = venue.filter(
    (v) => !existingVenueMap.has(v.id) && v.address,
  )

  let geocoded: GeocodedVenue[] = []
  if (missingVenues.length > 0) {
    console.log("geocoding", missingVenues.length)

    // 3. Only geocode missing venues
    const query = missingVenues.map((v) => ({
      types: ["address", "street"],
      q: `${v.name}, ${v.address}`,
      limit: 1,
    }))

    const response = await fetch(
      `https://api.mapbox.com/search/geocode/v6/batch?access_token=${env.NEXT_PUBLIC_MAPBOX_TOKEN}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(query),
      },
    )

    const data = (await response.json()) as GeocodeResponse

    geocoded = missingVenues.map((v, i) => {
      const result = data.batch[i]
      if (!result) return v
      const feature = result.features[0]
      const context = feature?.properties.context
      const coordinates = feature?.geometry.coordinates
      return {
        ...v,
        coordinates,
        mapbox_context: context,
      }
    })

    // 4. Insert new venues into Supabase
    if (geocoded.length > 0) {
      const { error } = await supabase.from("venues").insert(
        geocoded.map((v) => ({
          id: v.id,
          name: v.name,
          live: v.live,
          address: v.address,
          long: v.coordinates?.[0] ?? null,
          lat: v.coordinates?.[1] ?? null,
          mapbox_context: v.mapbox_context ?? null,
        })),
      )
      if (error) {
        console.error("error inserting venues", error)
      }
    }
  }

  // 5. Return all venues, combining existing and new, with coordinates and mapboxContext if available
  return venue.map((v) => {
    const existing = existingVenueMap.get(v.id)
    if (existing) {
      return {
        ...v,
        id: v.id,
        coordinates:
          typeof existing.long === "number" && typeof existing.lat === "number"
            ? [existing.long, existing.lat]
            : undefined,
        mapbox_context: existing.mapbox_context as MapboxContext,
      }
    }
    const geocodedVenue = geocoded.find((g) => g.id === v.id)
    return geocodedVenue ?? v
  })
}

const calculateMedianPoint = (venues: GeocodedVenue[]): [number, number] => {
  const filteredVenues = venues.filter((v) => v.coordinates)

  const lngValues = filteredVenues.map((v) => v.coordinates![0])
  const latValues = filteredVenues.map((v) => v.coordinates![1])

  const sortedLngValues = lngValues.sort((a, b) => a - b)
  const sortedLatValues = latValues.sort((a, b) => a - b)

  const medianLng = sortedLngValues[Math.floor(sortedLngValues.length / 2)]
  const medianLat = sortedLatValues[Math.floor(sortedLatValues.length / 2)]

  const medianPoint: [number, number] =
    medianLng !== undefined && medianLat !== undefined
      ? [medianLng, medianLat]
      : [-7.6921, 53.1424]

  return medianPoint
}
