import axios from "axios";
import { EventResponse, EventType, TicketmasterEvent } from "../types/Event";
import { TicketmasterVenue, Venue, VenueType } from "../types/Venue";
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

  const venue: TicketmasterVenue = {
    ticketmasterID: data.id,
    name: translateVenue(data.id) ?? data.name,
    city: data.city.name,
    state: data.state.stateCode,
    address: data.address.line1,
    postalCode: data.postalCode,
    type: VenueType.TICKETMASTER,
  };

  return venue;
};

/**
 * Convert the Ticketmaster API response to relevant details
 * @param data Ticketmaster API data
 * @returns Condensed event details
 */
const extractDetails = (data: any): EventResponse | undefined => {
  if (!data) {
    return;
  }

  const venueInfo = data._embedded.venues[0];

  const event: TicketmasterEvent = {
    type: EventType.TICKETMASTER,
    ticketmasterID: data.id,
    name: data.name,
    photo: data.images[1]?.url,
    venueID: venueInfo.id,
    date: new Date(data.dates.start.localDate),
    lineup: data._embedded.attractions?.map((a: any) => a.name) ?? [data.name],
  };

  const venue: TicketmasterVenue = {
    ticketmasterID: venueInfo.id,
    name: translateVenue(venueInfo.id) ?? venueInfo.name,
    city: venueInfo.city.name,
    state: venueInfo.state.stateCode,
    address: venueInfo.address.line1,
    postalCode: venueInfo.postalCode,
    type: VenueType.TICKETMASTER,
  };

  return {
    ...event,
    venue,
  };
};

/**
 * Get relevant details for the given event
 * @param id The ID of the event
 * @returns Relevant details for the given event
 */
export const getTicketmasterEvent = async (id: string) => {
  const res = await axios.get(`${base}/events/${id}`, {
    params: { apikey: apikey() },
  });
  const data = res.data;

  return extractDetails(data);
};

// Params for the search API
type EventQueryParams = {
  page?: number;
  size?: number;
  venueID?: string | string[];
  start?: Date;
  end?: Date;
  local?: string;
};

// Search for ticketmaster events
export const getTicketmasterEvents = async (params: EventQueryParams) => {
  let venues = params.venueID;

  if (venues) {
    if (params.local !== "false") {
      if (Array.isArray(venues)) {
        venues = venues.filter((v) => allVenues.find((av) => av.id === v));
        if (venues.length == 0) {
          return [];
        }
      } else {
        if (!allVenues.find((av) => venues?.includes(av.id))) {
          return [];
        }
      }
    }
  } else if (params.local !== "false") {
    venues = allVenues.map((v) => v.id);
  }

  const venueId = Array.isArray(venues) ? venues.join(",") : venues;

  const now = new Date().toISOString();

  const query: any = {
    apikey: process.env.TM_CONSUMER_KEY,
    page: params.page,
    size: params.size,
    venueId: venueId,
    localStartDateTime: params.start
      ? params.start + (params.end ? "," + params.end : "")
      : now.slice(0, now.length - 5),
    classificationName: "music",
    sort: "date,name,asc",
    countryCode: "US",
  };

  Object.keys(query).forEach(
    (key: string) => query[key] === undefined && delete query[key]
  );

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
