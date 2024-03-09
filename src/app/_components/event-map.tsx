"use client"

import * as React from "react"
import Map, { Marker, Popup } from "react-map-gl"
import { env } from "~/env"

import "mapbox-gl/dist/mapbox-gl.css"
import { type GeocodedVenue } from "../types"
import { VenueDrawer } from "./event-drawer"
import { useEffect, useMemo, useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs"
import { useTheme } from "next-themes"

import dayjs from "dayjs"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

// 51.829608, -0.730951

// 51.167276, 0.395573

const viewStates = {
  london: {
    longitude: -0.09,
    latitude: 51.5,
    zoom: 10,
  },
  barcelona: {
    longitude: 2.154007,
    latitude: 41.390205,
    zoom: 10,
  },
}

export default function VenueMap({
  venues,
  // setSelectedVenueId,
  // selectedVenueId,
  startDate: date,
  city,
}: {
  venues: GeocodedVenue[]
  startDate: Date
  city: string
  // setSelectedVenueId: (id: number) => void
  // selectedVenueId: number | null
}) {
  const [viewState, setViewState] = React.useState(
    viewStates[city as "london" | "barcelona"],
  )

  const paramsO = useSearchParams()
  const params = Object.fromEntries(paramsO)

  const [selectedVenueId, setSelectedVenueId] = useState<number | null>(null)
  const selectedVenue = useMemo(() => {
    return venues.find((venue) => venue.id === selectedVenueId) ?? null
  }, [selectedVenueId, venues])

  // const { theme } = useTheme()
  // const mapStyle =
  //   theme === "dark"
  //     ? "mapbox://styles/mapbox/dark-v11"
  //     : "mapbox://styles/mapbox/light-v11"
  const mapStyle = "mapbox://styles/mapbox/dark-v11"

  // console.log("yo frontend", venues)

  const dayMap = {
    yesterday: dayjs().subtract(1, "day"),
    today: dayjs(),
    tomorrow: dayjs().add(1, "day"),
  }

  const reverseMap = {
    [dayMap.yesterday.format("DD")]: "yesterday",
    [dayMap.today.format("DD")]: "today",
    [dayMap.tomorrow.format("DD")]: "tomorrow",
  }

  // today.isSame(date, "day")
  const tabValue = reverseMap[dayjs(date).format("DD")]

  console.log(date, city)

  // longitude: -0.09,
  // latitude: 51.5,

  useEffect(() => {
    // move the map
    // console.log("yo", initialViewState)
    setViewState(viewStates[params.city as "london" | "barcelona"])
  }, [params.city])

  return (
    <main className=" min-h-screen  bg-gradient-to-b from-[#221237] to-[#0a0015] text-white">
      <div className="fixed top-0 z-50 flex w-full flex-col bg-zinc-500 bg-opacity-30 p-2">
        <div>
          <h1 className="mb-3 text-2xl font-bold">RA Map: London</h1>
          {/* <p className="text-sm">Events happening in London</p> */}
        </div>
        <div className="flex items-center">
          <span>Start date:</span>
          <Tabs value={tabValue} className="ml-2" onChange={console.log}>
            <TabsList className="">
              <Link
                href={{
                  pathname: "/",
                  query: {
                    ...params,
                    startDate: dayMap.yesterday.format("YYYY-MM-DD"),
                  },
                }}
              >
                <TabsTrigger value="yesterday">
                  Yesterday {dayMap.yesterday.format("DD")}
                </TabsTrigger>
              </Link>
              <Link
                href={{
                  pathname: "/",
                  query: {
                    ...params,
                    startDate: dayMap.today.format("YYYY-MM-DD"),
                  },
                }}
              >
                <TabsTrigger value="today">
                  Today {dayMap.today.format("DD")}
                </TabsTrigger>
              </Link>
              <Link
                href={{
                  pathname: "/",
                  query: {
                    ...params,
                    startDate: dayMap.tomorrow.format("YYYY-MM-DD"),
                  },
                }}
              >
                <TabsTrigger value="tomorrow">
                  Tomorrow {dayMap.tomorrow.format("DD")}
                </TabsTrigger>
              </Link>
              {/* <TabsTrigger value="select">Select a date</TabsTrigger> */}
            </TabsList>
            {/*
          <TabsContent value="account">
          </TabsContent>
          <TabsContent value="password">Change your password here.</TabsContent>
        */}
          </Tabs>
        </div>

        <div className="mt-2 flex items-center">
          <span>City:</span>
          <Tabs value={city} className="ml-2" onChange={console.log}>
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
              {/* <TabsTrigger value="select">Select a date</TabsTrigger> */}
            </TabsList>
            {/*
          <TabsContent value="account">
          </TabsContent>
          <TabsContent value="password">Change your password here.</TabsContent>
        */}
          </Tabs>
        </div>
      </div>

      <div></div>

      <Map
        mapLib={import("mapbox-gl")}
        // initialViewState={initialViewState}
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

      <VenueDrawer
        venue={selectedVenue}
        setSelectedVenueId={setSelectedVenueId}
      />
    </main>
  )
}
