/* eslint-disable @typescript-eslint/consistent-type-imports */
// import { unstable_noStore as noStore } from "next/cache"
// import Link from "next/link"

// import { getServerAuthSession } from "~/server/auth"
// import { api } from "~/trpc/server"
import VenueMap from "./_components/event-map"
import { VenueData, fetchVenues } from "../lib/mapbox"
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

  const date = startDate ? new Date(startDate) : new Date()

  const area = parseInt(searchParams.area ?? "") || 13

  const cacheKey = `venues-${date.toISOString().slice(0, 10)}-${area}`

  console.log({ cacheKey })

  const venueData = await fetchVenues(date, area)

  return <VenueMap venueData={venueData} startDate={date} />
}
