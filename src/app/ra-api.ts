import { type RaEventWithVenue } from "./types"

export async function fetchEventsFromRa(date: Date, city: string) {
  const variables = makeVariables(date, city)

  const body = JSON.stringify({
    operationName: "GET_EVENT_LISTINGS",
    variables,
    query: raGql,
  })

  console.log("cv", city, variables)

  const region = city === "barcelona" ? "es/barcelona" : `uk/london`

  const res = await fetch("https://ra.co/graphql", {
    headers: {
      "content-type": "application/json",
      Referer: `https://ra.co/events/${region}`,
    },
    body,
    method: "POST",
  })

  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    console.error("error ra", res.status, res.body)
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

  // const geocoded = geocodingClient.forwardGeocode({
  //   query: 'Paris, France',
  //   limit: 2
  // })
  //   .send()
  //   .then(response => {
  //     const match = response.body;
  //   });
}
const makeVariables = (date: Date, city: string) => {
  // const thisSunday =
  //   new Date().getDay() === 0
  //     ? new Date()
  //     : new Date(
  //         new Date().setDate(new Date().getDate() + 7 - new Date().getDay()),
  //       )
  // const sixHoursAgo = new Date(new Date().setHours(new Date().getHours() - 24))

  return {
    filters: {
      areas: {
        eq: city === "barcelona" ? 20 : 13,
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
