/* eslint-disable @typescript-eslint/consistent-type-imports */
// import { unstable_noStore as noStore } from "next/cache"
// import Link from "next/link"

// import { getServerAuthSession } from "~/server/auth"
// import { api } from "~/trpc/server"
import VenueMap from "./_components/event-map"
import { VenueData, fetchVenues } from "../lib/mapbox"
import { db } from "~/server/db"
import { env } from "~/env"

export const revalidate = 3600

export default async function Home({
  searchParams,
}: {
  searchParams: { startDate?: string; area?: string }
}) {
  // const params = useSearchParams()

  const { startDate } = searchParams

  console.log("startDate", startDate)

  // const startDateQuery = params.get("startDate")
  const date = startDate ? new Date(startDate) : new Date()
  // const city = searchParams.city ? searchParams.city.toLowerCase().trim() : null

  // if (!city) {
  //   return (
  //     <div>
  //       <h1>Loading...</h1>
  //     </div>
  //   )
  // }

  const area = parseInt(searchParams.area ?? "") || 13

  const cacheKey = `venues-${date.toISOString().slice(0, 10)}-${area}`

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

  let venueData: VenueData
  if (venueCache) {
    console.log("cache hit")
    venueData = venueCache.data as VenueData
  } else {
    const result = await fetchVenues(date, area)

    if (env.NODE_ENV === "development") {
      await db.cache.upsert({
        where: { key: cacheKey },
        create: {
          key: cacheKey,
          data: result,
        },
        update: {
          data: result,
        },
      })
    }

    venueData = result
  }

  return <VenueMap venueData={venueData} startDate={date} />
}
