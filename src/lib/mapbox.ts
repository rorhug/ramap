"use server"

import { env } from "~/env"
import {
  type RaVenue,
  type GeocodedVenue,
  type GeocodeResponse,
  type AreaObject,
} from "./types"
import { fetchArea, fetchEventsFromRa } from "./ra-api"

import { cache } from "react"

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

    console.log("geocoded", geocoded.length)

    return { venues: geocoded, medianPoint, area }
  },
)

export { fetchVenues }

async function geocodeEvents(venue: RaVenue[]): Promise<GeocodedVenue[]> {
  // const result = await client.forwardGeocode({ query: "" }).send();.
  const query = venue.map((v) => ({
    types: ["address", "street"],
    q: `${v.name}, ${v.address}`,
    // q: v.address,
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

  return venue.map((v, i) => {
    const result = data.batch[i]

    if (!result) return v

    const feature = result.features[0]
    const context = feature?.properties.context

    // if (v.name === "HERE") {
    //   console.log("here", data.batch[i])
    // }

    const coordinates = feature?.geometry.coordinates

    return {
      ...v,
      coordinates,
      mapboxContext: context,
    }
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
