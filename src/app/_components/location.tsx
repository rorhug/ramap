import { useState, useEffect, useCallback } from "react"

import {
  CalendarIcon,
  EnvelopeClosedIcon,
  FaceIcon,
  GearIcon,
  PersonIcon,
  RocketIcon,
  CaretRightIcon,
  CaretDownIcon,
} from "@radix-ui/react-icons"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "~/components/ui/command"
import { fetchRaLocations } from "~/lib/ra-api"
import { AreaObject, CountryObject } from "~/lib/types"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"
import NProgress from "nprogress"

export const revalidate = 86400

export function LocationSearch({ area }: { area: AreaObject }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [countries, setCountries] = useState<CountryObject[] | null>()

  // Get a new searchParams string by merging the current
  // searchParams with a provided key/value pair
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)

      return params.toString()
    },
    [searchParams],
  )

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  useEffect(() => {
    if (open && !countries) {
      void (async () => {
        const locations = await fetchRaLocations()
        setCountries(locations.data.countries)
        // console.log("locations", locations.data.countries)
      })()
    }
  }, [open, countries])

  const goToArea = (area: AreaObject) => () => {
    // console.log(country)
    // params.set("area", country.areas[0]?.id)
    // const id = country.areas[0]?.id
    // params.
    if (typeof area.id === "string") {
      NProgress.start()
      router.push(`/?${createQueryString("area", area.id)}`)
      setOpen(false)
    }
  }

  return (
    <>
      <Button
        className="justify-between"
        variant="secondary"
        onClick={() => setOpen(true)}
      >
        {area.name} - {area.country.name}
        <CaretDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {countries?.map((country) => {
            if (country.areas.length === 0) return null
            if (country.areas.length === 1) {
              const area = country.areas[0]!
              return (
                <CommandItem
                  key={area.id}
                  keywords={[country.name]}
                  className="ml-2"
                  onSelect={goToArea(area)}
                  onClick={goToArea(area)}
                >
                  <span className={cn(area.isCountry && "font-semibold")}>
                    {area.isCountry ? area.country.name : area.name}
                  </span>
                </CommandItem>
              )
            }
            return (
              <CommandGroup heading={country.name} key={`c-${country.id}`}>
                {country.areas.map((area) => {
                  return (
                    <CommandItem
                      key={area.id}
                      keywords={[country.name]}
                      onSelect={goToArea(area)}
                      onClick={goToArea(area)}
                    >
                      <span
                        className={cn(
                          area.isCountry && "font-semibold",
                          "ml-2",
                        )}
                      >
                        {area.isCountry
                          ? `${area.country.name} - All`
                          : area.name}
                      </span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            )
          })}
          {/* 
          <CommandGroup heading="Suggestions">
            <CommandItem>
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>Calendar</span>
            </CommandItem>
            <CommandItem>
              <FaceIcon className="mr-2 h-4 w-4" />
              <span>Search Emoji</span>
            </CommandItem>
            <CommandItem>
              <RocketIcon className="mr-2 h-4 w-4" />
              <span>Launch</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>
              <PersonIcon className="mr-2 h-4 w-4" />
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <EnvelopeClosedIcon className="mr-2 h-4 w-4" />
              <span>Mail</span>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <GearIcon className="mr-2 h-4 w-4" />
              <span>Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup> */}
        </CommandList>
      </CommandDialog>
    </>
  )
}
