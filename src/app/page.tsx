/* eslint-disable @typescript-eslint/consistent-type-imports */
// import { unstable_noStore as noStore } from "next/cache"
// import Link from "next/link"

// import { getServerAuthSession } from "~/server/auth"
// import { api } from "~/trpc/server"
import VenueMap from "./_components/event-map"
import { fetchVenues } from "./mapbox"

export const revalidate = 3600

export default async function Home() {
  // noStore();
  // const hello = await api.post.hello.query({ text: "from tRPC" });
  // const session = await getServerAuthSession();

  const venues = await fetchVenues()

  console.log("yo frontend", venues.length)

  return (
    <VenueMap
      venues={venues}
      // selectedVenueId={selectedVenueId}
      // setSelectedVenueId={setSelectedVenueId}
    />
  )
}
