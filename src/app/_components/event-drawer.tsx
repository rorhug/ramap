import { Button } from "~/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer"

import { Card, CardContent } from "~/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel"
import { type GeocodedVenue, type RaEvent } from "../types"
import { useEffect, useState } from "react"
import Image from "next/image"

export function VenueDrawer({
  venue,
  setSelectedVenueId,
}: {
  venue: GeocodedVenue | null
  setSelectedVenueId: (id: number | null) => void
}) {
  const [open, setOpen] = useState(false)
  //

  useEffect(() => {
    if (venue?.id) setOpen(true)
  }, [venue?.id])

  return (
    <Drawer
      open={open}
      onClose={() => {
        setOpen(false)
        setSelectedVenueId(null)
      }}
      dismissible={true}

      // modal={true}
    >
      <DrawerContent className="w-full max-w-3xl justify-self-center">
        {/* <DrawerTrigger>Open</DrawerTrigger> */}
        {venue && (
          <VenueDrawerContent
            venue={venue}
            close={() => {
              setOpen(false)
            }}
          />
        )}
      </DrawerContent>
    </Drawer>
  )
}

function VenueDrawerContent({
  venue,
  close,
}: {
  venue: GeocodedVenue
  close: () => void
}) {
  const { events, coordinates, address, name, id } = venue

  return (
    <>
      <DrawerHeader>
        <DrawerTitle>{name}</DrawerTitle>
        <DrawerDescription>
          {address}
          <br />
          {
            <a
              className=" text-blue-700 underline hover:no-underline"
              href={`https://ra.co/clubs/${id}`}
              target="_blank"
            >
              RA
            </a>
          }
          {
            <a
              href={`https://www.google.com/maps?q=${name} ${address}`}
              className="ml-3 text-blue-700 underline hover:no-underline"
              target="_blank"
            >
              Google Maps
            </a>
          }
          {coordinates && (
            <a
              href={`https://citymapper.com/directions?endcoord=${coordinates[1]},${coordinates[0]}&endname=${name}&endaddress=${address}`}
              className="ml-3 text-blue-700 underline hover:no-underline"
              target="_blank"
            >
              Citymapper
            </a>
          )}
        </DrawerDescription>
      </DrawerHeader>
      {events && events.length >= 1 ? (
        <>
          {events.length >= 2 && (
            <p className="ml-4 text-zinc-600">{events.length} events 🔛</p>
          )}
          <Carousel>
            <CarouselContent>
              {events?.map((event) => (
                <EventInfo key={event.id} event={event} />
              ))}
            </CarouselContent>
            {events.length >= 2 && (
              <>
                <CarouselPrevious />
                <CarouselNext />
              </>
            )}
          </Carousel>
        </>
      ) : (
        <p>No events</p>
      )}
      <DrawerFooter>
        {/* <DrawerClose> */}
        <Button variant="outline" onClick={close}>
          Close
        </Button>
        {/* </DrawerClose> */}
      </DrawerFooter>
    </>
  )
}

const toTimeString = (date: string) => new Date(date).toLocaleString()

const EventInfo = ({ event }: { event: RaEvent }) => {
  const { title, id, startTime, endTime } = event
  const image = event.images[0]

  return (
    <CarouselItem>
      <div className="p-2">
        <Card className="rounded-sm">
          <CardContent className=" flex justify-center p-3">
            {image && (
              <Image
                className="mr-2 w-24 rounded-md object-cover"
                src={image.filename}
                alt={image.alt}
                width={100}
                height={150}
              />
            )}
            {/* tailwind lineheight:  */}
            <div className="items-left flex flex-1 flex-col">
              <h2 className="mb-2 leading-4">{title}</h2>
              <p className="mb-4 text-xs text-zinc-600">
                {toTimeString(startTime)} - {toTimeString(endTime)}
              </p>
              <a href={`https://ra.co/events/${id}`} target="_blank">
                <Button className="w-full" variant="secondary">
                  Tickets / Info
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </CarouselItem>
  )
}
