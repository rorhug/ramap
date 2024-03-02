"use server"

import { env } from "~/env"
import { type RaVenue, type GeocodedVenue, type GeocodeResponse } from "./types"
import { fetchEventsFromRa } from "./ra-api"

import { cache } from "react"

// async function fetchVenues() {
const fetchVenues = cache(async () => {
  const eventResponse = await fetchEventsFromRa()

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

  console.log("geocoded", geocoded.length)

  return geocoded
})

export { fetchVenues }

async function geocodeEvents(venue: RaVenue[]): Promise<GeocodedVenue[]> {
  // const result = await client.forwardGeocode({ query: "" }).send();.
  const query = venue.map((v) => ({
    types: ["address"],
    q: v.address,
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
    const feature = data.batch[i]?.features[0]
    const coordinates = feature?.geometry.coordinates
    const inLondon = coordinates && isWithinBoundingBox(coordinates)

    return {
      ...v,
      coordinates,
      inLondon,
    }
  })
}
const LONDON_BOUNDING_BOX: [[number, number], [number, number]] = [
  [-0.730951, 51.167276],
  [0.395573, 51.829608],
]
const isWithinBoundingBox = (coordinates: [number, number]) => {
  const [lng, lat] = coordinates
  const [min, max] = LONDON_BOUNDING_BOX

  return lng > min[0] && lng < max[0] && lat > min[1] && lat < max[1]
}
