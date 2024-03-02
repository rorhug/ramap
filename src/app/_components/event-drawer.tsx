import { Button } from "~/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer"

import { Card, CardContent } from "~/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel"
import { GeocodedVenue, RaEvent } from "../types"
import { useEffect, useState } from "react"

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
    >
      <DrawerContent>
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
  const { events, coordinates, address, name, inLondon, id } = venue

  return (
    <>
      <DrawerHeader>
        <DrawerTitle>{name}</DrawerTitle>
        <DrawerDescription>
          <p>
            {address}
            <br />
            {
              <a
                className="ml-3 text-blue-700 underline hover:no-underline"
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
          </p>
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
            <CarouselPrevious />
            <CarouselNext />
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
              <img
                className="mr-2 w-24 rounded-md object-cover"
                src={image.filename}
                alt={image.alt}
              />
            )}
            {/* tailwind lineheight:  */}
            <div className="items-left flex flex-col">
              <h2 className="mb-2 text-sm leading-4">{title}</h2>
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
