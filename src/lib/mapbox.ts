"use server"

import { env } from "~/env"
import { type RaVenue, type GeocodedVenue, type GeocodeResponse } from "./types"
import { fetchEventsFromRa } from "./ra-api"

import { cache } from "react"

// async function fetchVenues() {
const fetchVenues = cache(async (date: Date, city: string) => {
  const eventResponse = await fetchEventsFromRa(date, city)

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
