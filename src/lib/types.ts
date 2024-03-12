export type RaEvent = {
  id: number
  date: string
  startTime: string
  endTime: string
  title: string
  contentUrl: string
  flyerFront: string
  isTicketed: boolean
  attending: number
  queueItEnabled: boolean
  newEventForm: boolean
  images: {
    id: number
    filename: string
    alt: string
    type: string
    crop: string
  }[]
  pick: {
    id: number
    blurb: string
  }
}
export type RaEventWithVenue = RaEvent & {
  venue: RaVenue
}
export type RaVenue = {
  id: number
  name: string
  contentUrl: string
  live: boolean
  address: string
  events?: RaEvent[]
}
export type GeocodedVenue = RaVenue & {
  coordinates?: [number, number]
  mapboxContext?: MapboxContext
}
export type GeocodeResponse = {
  batch: {
    type: string
    features: {
      type: string
      id: string
      geometry: {
        type: string
        coordinates: [number, number]
      }
      properties: {
        mapbox_id: string
        feature_type: string
        name: string
        coordinates: {
          longitude: number
          latitude: number
          accuracy: string
        }
        place_formatted: string
        match_code: {
          address_number: string
          street: string
          postcode: string
          place: string
          region: string
          locality: string
          country: string
          confidence: string
        }
        context: MapboxContext
      }
    }[]
  }[]
}

type MapboxContext = {
  address: {
    mapbox_id: string
    address_number: string
    street_name: string
    name: string
  }
  street: {
    mapbox_id: string
    name: string
  }
  neighborhood: {
    mapbox_id: string
    name: string
    alternate: {
      mapbox_id: string
      name: string
    }
  }
  postcode: {
    mapbox_id: string
    name: string
  }
  place: {
    mapbox_id: string
    name: string
    wikidata_id: string
  }
  region: {
    mapbox_id: string
    name: string
    wikidata_id: string
    region_code: string
    region_code_full: string
  }
  country: {
    mapbox_id: string
    name: string
    wikidata_id: string
    country_code: string
    country_code_alpha_3: string
  }
}
