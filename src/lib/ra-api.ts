"use server"

import { cache } from "react"
import { AreaObject, CountryObject, type RaEventWithVenue } from "./types"

export async function fetchEventsFromRa(date: Date, area: number) {
  const variables = makeVariables(date, area)

  const body = JSON.stringify({
    operationName: "GET_EVENT_LISTINGS",
    variables,
    query: raGql,
  })

  console.log("cv", area, variables)

  // const region = city === "barcelona" ? "es/barcelona" : `uk/london`

  const res = await fetch("https://ra.co/graphql", {
    headers: {
      "content-type": "application/json",
      Referer: `https://ra.co/events`,
    },
    body,
    method: "POST",
  })

  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    console.error("error ra events", res.status, await res.text())
    throw new Error("Failed to fetch data")
  }

  return res.json() as Promise<{
    data: {
      eventListings: {
        data: { id: number; listingDate: string; event: RaEventWithVenue }[]
        filterOptions: {
          genre: {
            label: string
            value: string
            count: number
          }[]
          eventType: {
            value: string
            count: number
          }[]
        }
        totalResults: number
      }
    }
  }>
}

const makeVariables = (date: Date, area: number) => {
  return {
    filters: {
      areas: {
        eq: area,
      },
      listingDate: {
        gte: date.toISOString().split("T")[0],
        lte: date.toISOString().split("T")[0],
      },
    },
    filterOptions: {
      genre: true,
      eventType: true,
    },
    pageSize: 100,
    page: 1,
  }
}

const raGql = `
query GET_EVENT_LISTINGS($filters: FilterInputDtoInput, $filterOptions: FilterOptionsInputDtoInput, $page: Int, $pageSize: Int) {
  eventListings(filters: $filters, filterOptions: $filterOptions, pageSize: $pageSize, page: $page) {
    data {
      id
      listingDate
      event {
        ...eventListingsFields
        artists {
          id
          name
          __typename
        }
        __typename
      }
      __typename
    }
    filterOptions {
      genre {
        label
        value
        count
        __typename
      }
      eventType {
        value
        count
        __typename
      }
      __typename
    }
    totalResults
    __typename
  }
}

fragment eventListingsFields on Event {
  id

  date
  startTime
  endTime
  title
  contentUrl
  flyerFront
  isTicketed
  attending
  queueItEnabled
  newEventForm

  images {
    id
    filename
    alt
    type
    crop
    __typename
  }
  pick {
    id
    blurb
    __typename
  }
  venue {
    id
    name
    contentUrl
    live
    address
    __typename
  }
  __typename
}
`

export const fetchRaLocations = cache(async () => {
  const body = JSON.stringify({
    operationName: "GET_ALL_LOCATIONS_QUERY",
    variables: {},
    query: locationsQuery,
  })

  const res = await fetch("https://ra.co/graphql", {
    headers: {
      "content-type": "application/json",
      Referer: `https://ra.co/events`,
    },
    body,
    method: "POST",
  })

  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    console.error("error ra locs", res.status, await res.text())
    throw new Error("Failed to fetch data")
  }

  return res.json() as Promise<{ data: { countries: CountryObject[] } }>
})

const locationsQuery = `
query GET_ALL_LOCATIONS_QUERY {
  countries {
    id
    name
    urlCode
    topCountry
    order
    areas {
      id
      name
      isCountry
      urlName
      parentId
      subregion {
        id
        name
        urlName
        country {
          id
          name
          urlCode
          __typename
        }
        __typename
      }
      country {
        id
        name
        urlCode
        __typename
      }
      __typename
    }
    __typename
  }
}
`

export const fetchArea = cache(async (area: number) => {
  const body = JSON.stringify({
    operationName: "GET_EVENTS_AREA",
    variables: { id: area },
    query: areaQuery,
  })

  const res = await fetch("https://ra.co/graphql", {
    headers: {
      "content-type": "application/json",
      Referer: `https://ra.co/events`,
    },
    body,
    method: "POST",
  })

  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    const text = await res.text()
    console.error("error ra area", res.status, text)

    throw new Error("Failed to fetch data")
  }

  return res.json() as Promise<{ data: { eventsArea: AreaObject } }>
})

const areaQuery = `
query GET_EVENTS_AREA($id: ID) {
  eventsArea: area(id: $id) {
    ...areaFields
    __typename
  }
}

fragment areaFields on Area {
  id
  name
  urlName
  ianaTimeZone
  blurb
  country {
    id
    name
    urlCode
    requiresCookieConsent
    __typename
  }
  __typename
}

`
