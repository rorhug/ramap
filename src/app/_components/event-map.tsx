"use client"

import * as React from "react"
import Map, { Marker } from "react-map-gl"
import { env } from "~/env"

import "mapbox-gl/dist/mapbox-gl.css"
import { useEffect, useMemo, useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { VenueDrawer } from "./event-drawer"

import dayjs from "dayjs"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "~/components/ui/button"
import { type VenueData } from "~/lib/mapbox"
import { LocationSearch } from "./location"

import NProgress from "nprogress"

// const viewStates = {
//   london: {
//     longitude: -0.09,
//     latitude: 51.5,
//     zoom: 10,
//   },
//   barcelona: {
//     longitude: 2.154007,
//     latitude: 41.390205,
//     zoom: 10,
//   },
// }

export default function VenueMap({
  venueData,
  startDate: date,
}: {
  venueData: VenueData
  startDate: Date
}) {
  const { venues, medianPoint, area } = venueData

  const [viewState, setViewState] = React.useState({
    zoom: 10,
    longitude: medianPoint[0] ?? -7.6921,
    latitude: medianPoint[1] ?? 53.1424,
  })

  useEffect(() => {
    setViewState({
      zoom: 10,
      longitude: medianPoint[0],
      latitude: medianPoint[1],
    })
  }, [medianPoint])

  const paramsO = useSearchParams()
  const params = Object.fromEntries(paramsO)

  useEffect(() => {
    NProgress.done()
  }, [paramsO])

  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null)
  const selectedVenue = useMemo(() => {
    return venues.find((venue) => venue.id === selectedVenueId) ?? null
  }, [selectedVenueId, venues])

  const mapStyle = "mapbox://styles/mapbox/dark-v11"

  const daysArray = Array.from({ length: 9 }, (_, i) => i - 1)
  const days = daysArray.map((i) => dayjs().add(i, "day"))

  // const area = venues[0]?.address

  return (
    <main className=" min-h-screen  bg-gradient-to-b from-[#221237] to-[#0a0015] text-white">
      <div className="fixed top-0 z-50 flex w-full flex-col bg-zinc-500 bg-opacity-30 p-2">
        <div className="mb-2 flex flex-row">
          <h1 className=" flex-1 text-xl font-bold">
            MusicMap: {area.name.toUpperCase()} -{" "}
            {dayjs(date).format("ddd DD MMMM")}
          </h1>
        </div>

        <div className="mb-2">
          <LocationSearch area={area} />
        </div>

        <div className="-mx-2 flex items-center overflow-x-scroll px-2">
          <Tabs value={dayjs(date).format("YYYY-MM-DD")}>
            <TabsList className="">
              {days.map((day) => {
                const str = day.format("YYYY-MM-DD")

                return (
                  <Link
                    key={str}
                    href={{
                      pathname: "/",
                      query: {
                        ...params,
                        startDate: str,
                      },
                    }}
                  >
                    <TabsTrigger value={str}>
                      {day.format("ddd DD")}
                    </TabsTrigger>
                  </Link>
                )
              })}
            </TabsList>
          </Tabs>
        </div>
        {venues.length === 0 && (
          <>
            <h2 className="py-3 text-2xl font-semibold">No events found.</h2>
            <h2 className=" italic opacity-70">
              Try a different location or date.
            </h2>
          </>
        )}

        {/* <div className="mt-2 flex items-center">
          <Tabs value={city} onChange={console.log}>
            <TabsList className="">
              <Link
                href={{
                  pathname: "/",
                  query: { ...params, city: "barcelona" },
                }}
              >
                <TabsTrigger value="barcelona">Barcelona</TabsTrigger>
              </Link>
              <Link
                href={{
                  pathname: "/",
                  query: { ...params, city: "london" },
                }}
              >
                <TabsTrigger value="london">London</TabsTrigger>
              </Link>
            </TabsList>
          </Tabs>
        </div> */}
      </div>

      <div></div>

      <Map
        mapLib={import("mapbox-gl")}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        style={{ width: "100vw", height: "100vh" }}
        mapStyle={mapStyle}
        mapboxAccessToken={env.NEXT_PUBLIC_MAPBOX_TOKEN}
      >
        {venues.map((venue) => {
          const { coordinates } = venue

          if (!coordinates) {
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
                className={`cursor-pointer rounded-sm border border-solid border-green-500 bg-green-400 p-1 text-2xl hover:bg-opacity-100 ${selectedVenueId === venue.id ? "bg-opacity-100" : "bg-opacity-30"}`}
              >
                🏢
              </span>
            </Marker>
          )
        })}
      </Map>

      <div className="fixed bottom-0 flex w-full justify-center">
        <a
          href="https://whatsapp.com/channel/0029VaSmZqqC6Zvq8Z62LJ1K"
          target="_blank"
          className="flex"
        >
          <Button
            variant="secondary"
            className="rounded-b-none bg-green-600 text-white"
          >
            💬 WhatsApp
          </Button>
        </a>
      </div>

      <VenueDrawer
        venue={selectedVenue}
        setSelectedVenueId={setSelectedVenueId}
      />
    </main>
  )
}
