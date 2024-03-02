import { RaEventWithVenue } from "./types"

export async function fetchEventsFromRa() {
  const body = JSON.stringify({
    operationName: "GET_EVENT_LISTINGS",
    variables: variables(),
    query: raGql,
  })

  const res = await fetch("https://ra.co/graphql", {
    headers: {
      // "accept": "*/*",
      // "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      // "cache-control": "no-cache",
      "content-type": "application/json",
      // "pragma": "no-cache",
      // "ra-content-language": "en",
      // "sec-ch-ua": "\"Chromium\";v=\"122\", \"Not(A:Brand\";v=\"24\", \"Brave\";v=\"122\"",
      // "sec-ch-ua-mobile": "?0",
      // "sec-ch-ua-model": "\"\"",
      // "sec-ch-ua-platform": "\"macOS\"",
      // "sec-fetch-dest": "empty",
      // "sec-fetch-mode": "cors",
      // "sec-fetch-site": "same-origin",
      // "sec-gpc": "1",
      Referer: "https://ra.co/events/uk/london",
      // "Referrer-Policy": "strict-origin-when-cross-origin"
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
const variables = () => {
  const thisSunday =
    new Date().getDay() === 0
      ? new Date()
      : new Date(
          new Date().setDate(new Date().getDate() + 7 - new Date().getDay()),
        )
  const sixHoursAgo = new Date(new Date().setHours(new Date().getHours() - 6))

  return {
    filters: {
      areas: {
        eq: 13,
      },
      listingDate: {
        gte: sixHoursAgo.toISOString().split("T")[0],
        lte: thisSunday.toISOString().split("T")[0],
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
