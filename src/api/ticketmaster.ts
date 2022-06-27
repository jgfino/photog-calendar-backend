import axios from "axios";
import { TicketmasterEvent } from "../types/Event";
import { Venue } from "../types/Venue";
import venues from "./venues.json";

const base = "https://app.ticketmaster.com/discovery/v2";
const apikey = () => process.env.TM_CONSUMER_KEY;
const allVenues = [...venues.smallVenues, ...venues.venues];

const translateVenue = (id: string) => allVenues.find((v) => v.id === id)?.name;

/**
 * Get relevant details about the venue with the given ID
 * @param id The venue ID to get details for
 * @returns Details of the given venue
 */
export const getVenueDetails = async (id: string): Promise<Venue> => {
  const res = await axios.get(`${base}/venues/${id}`, {
    params: { apikey: apikey() },
  });
  const data = res.data;

  const venue: Venue = {
    id: data.id,
    name: allVenues.find((v) => v.id === data.id)?.name ?? data.name,
    city: data.city.name,
    state: data.state.stateCode,
    address: data.address.line1,
    postalCode: data.postalCode,
  };

  return venue;
};

/**
 * Convert the Ticketmaster API response to relevant details
 * @param data Ticketmaster API data
 * @returns Condensed event details
 */
const extractDetails = (data: any) => {
  if (!data) {
    return null;
  }

  const venue = data._embedded.venues[0];

  const event = {
    type: "TICKETMASTER",
    tickemasterID: data.id,
    name: data.name,
    photo: data.images[1]?.url,
    venueId: venue.id,
    venueName: translateVenue(venue.id) ?? venue.name,
    venueCity: venue.city.name,
    venueState: venue.state.stateCode,
    date: new Date(data.dates.start.localDate),
    local: allVenues.find((v) => v.id == venue.id) !== undefined,
    tmTime: data.dates,
  };
  return event;
};

/**
 * Get relevant details for the given event
 * @param id The ID of the event
 * @returns Relevant details for the given event
 */
export const getEventDetails = async (id: string) => {
  const res = await axios.get(`${base}/events/${id}`, {
    params: { apikey: apikey() },
  });
  const data = res.data;
  return extractDetails(data);
};

/**
 * Get details about multiple events
 * @param ids The event IDs to get
 * @param page Results page number
 * @param size Number of events to return per page
 * @returns Details about the given events
 */
export const getEvents = async (
  ids: string[],
  page: number = 0,
  size: number = 0
): Promise<TicketmasterEvent[]> => {
  const events = await axios.get(`${base}/events`, {
    params: {
      apikey: apikey(),
      page,
      size,
      id: ids.join(","),
      sort: "date,name,asc",
    },
  });
  return events.data._embedded.events.map((e: any) => extractDetails(e));
};

/**
 * Get a list of all events at our venues
 * @param page Results page number
 * @param size Number of events to return per page
 * @returns Details about events at all our venues
 */
export const getEventsAtVenues = async (
  page: number = 0,
  size: number = 20
): Promise<TicketmasterEvent[]> => {
  const venueIds = allVenues.map((v) => v.id);
  return getEventsAtVenue(venueIds.join(","), page, size);
};

export const getEventsAtVenuesByMonth = async (
  month: number
): Promise<TicketmasterEvent[] | null> => {
  let data: any = {};
  let nextPage = 0;
  let events: any[] = [];
  const venueId = allVenues.map((v) => v.id).join(",");

  const currentYear = new Date().getFullYear();
  const start = new Date(currentYear, month - 1, 1);
  const end = new Date(currentYear, month, 0);

  do {
    const next = await axios.get(`${base}/events`, {
      params: {
        apikey: apikey(),
        venueId,
        classificationName: "music",
        sort: "date,name,asc",
        size: 200,
        page: nextPage,
        startDateTime: start.toISOString().split(".")[0] + "Z",
        endDateTime: end.toISOString().split(".")[0] + "Z",
      },
    });
    data = next.data;
    const newEvents = data._embedded?.events ?? [];
    events = [...events, ...newEvents];
    nextPage += 1;
  } while (data.page?.number < data.page?.totalPages);

  return events
    .map((e) => extractDetails(e))
    .filter((d) => d != null) as TicketmasterEvent[];
};

/**
 * Get events at a specific venue
 * @param venueId The id of the venue to get events at
 * @param page Results page number
 * @param size Number of events to return per page
 * @returns Details about events at the given venue
 */
export const getEventsAtVenue = async (
  venueId: string,
  page: number = 0,
  size: number = 20
): Promise<TicketmasterEvent[]> => {
  const res = await axios.get(`${base}/events`, {
    params: {
      apikey: apikey(),
      venueId: venueId,
      classificationName: "music",
      sort: "date,name,asc",
      page,
      size,
    },
  });
  const events = res.data._embedded?.events ?? [];
  return events.map((e: any) => extractDetails(e));
};

type EventQueryParams = {
  page?: number;
  size?: number;
  venueId?: string | string[];
  start?: Date;
  end?: Date;
  local?: string;
};

export const getTicketmasterEvents = async (params: EventQueryParams) => {
  let venues = params.venueId;

  if (venues) {
    if (params.local !== "false") {
      if (Array.isArray(venues)) {
        venues = venues.filter((v) => allVenues.find((av) => av.id === v));
        if (venues.length == 0) {
          return [];
        }
      } else {
        if (!allVenues.find((av) => venues)) {
          return [];
        }
      }
    }
  } else if (params.local != "false") {
    // console.log(params.local);
    venues = allVenues.map((v) => v.id);
  }

  const venueId = Array.isArray(venues) ? venues.join(",") : venues;

  const query: any = {
    apikey: process.env.TM_CONSUMER_KEY,
    page: params.page,
    size: params.size,
    venueId: venueId,
    localStartDateTime: params.start + (params.end ? "," + params.end : ""),
    classificationName: "music",
    sort: "date,name,asc",
    countryCode: "US",
  };

  Object.keys(query).forEach(
    (key: string) => query[key] === undefined && delete query[key]
  );

  console.log(query);

  const events = await axios.get(`${base}/events`, {
    params: query,
  });

  const data = events.data._embedded;

  if (data) {
    return events.data._embedded.events.map((e: any) => extractDetails(e));
  } else {
    return [];
  }
};
