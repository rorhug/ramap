/* eslint-disable @typescript-eslint/consistent-type-imports */
// import { unstable_noStore as noStore } from "next/cache"
// import Link from "next/link"

// import { getServerAuthSession } from "~/server/auth"
// import { api } from "~/trpc/server"
import VenueMap from "./_components/event-map"
import { fetchVenues } from "../lib/mapbox"
import { db } from "~/server/db"
import { GeocodedVenue } from "~/lib/types"
import { env } from "~/env"

export const revalidate = 3600

export default async function Home({
  searchParams,
}: {
  searchParams: { startDate?: string; city?: string }
}) {
  // const params = useSearchParams()

  const { startDate } = searchParams

  console.log("startDate", startDate)

  // const startDateQuery = params.get("startDate")
  const date = startDate ? new Date(startDate) : new Date()
  const city = (searchParams.city ?? "london").toLowerCase().trim()

  const cacheKey = `venues-${date.toISOString().slice(0, 10)}-${city}`

  console.log({ cacheKey })

  const venueCache =
    env.NODE_ENV === "development"
      ? await db.cache.findFirst({
          where: {
            key: cacheKey,
            updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
        })
      : null

  let venues: GeocodedVenue[]
  if (venueCache) {
    console.log("cache hit")
    venues = venueCache.data as GeocodedVenue[]
  } else {
    venues = await fetchVenues(date, city)

    if (env.NODE_ENV === "development") {
      await db.cache.upsert({
        where: { key: cacheKey },
        create: {
          key: cacheKey,
          data: venues,
        },
        update: {
          data: venues,
        },
      })
    }
  }

  return <VenueMap venues={venues} startDate={date} city={city} />
}
