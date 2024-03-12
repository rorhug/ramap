/* eslint-disable @typescript-eslint/consistent-type-imports */
// import { unstable_noStore as noStore } from "next/cache"
// import Link from "next/link"

// import { getServerAuthSession } from "~/server/auth"
// import { api } from "~/trpc/server"
import VenueMap from "./_components/event-map"
import { fetchVenues } from "../lib/mapbox"

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

  const city = searchParams.city ?? "london"

  const venues = await fetchVenues(date, city)

  return <VenueMap venues={venues} startDate={date} city={city} />
}
