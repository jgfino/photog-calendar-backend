import axios from "axios";
import { TicketmasterEvent } from "../types/Event";
import { TicketmasterVenue } from "../types/Venue";
import venues from "./venues.json";

const base = "https://app.ticketmaster.com/discovery/v2";
const apikey = () => process.env.TM_CONSUMER_KEY;
const allVenues = [...venues.smallVenues, ...venues.venues];

/**
 * Get relevant details about the venue with the given ID
 * @param id The venue ID to get details for
 * @returns Details of the given venue
 */
export const getVenueDetails = async (
  id: string
): Promise<TicketmasterVenue> => {
  const res = await axios.get(`${base}/venues/${id}`, {
    params: { apikey: apikey() },
  });
  const data = res.data;

  const venue: TicketmasterVenue = {
    id: data.id,
    name: allVenues.find((v) => v.id === data.id)!.name,
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
const extractDetails = (data: any): TicketmasterEvent | null => {
  if (!data) {
    return null;
  }
  const event: TicketmasterEvent = {
    id: data.id,
    name: data.name,
    photo: data.images[1]?.url,
    venueId: data._embedded.venues[0].id,
    venueName: allVenues.find((v) => v.id === data._embedded.venues[0].id)!
      .name,
    date: new Date(data.dates.start.localDate),
  };
  return event;
};

/**
 * Get relevant details for the given event
 * @param id The ID of the event
 * @returns Relevant details for the given event
 */
export const getEventDetails = async (
  id: string
): Promise<TicketmasterEvent | null> => {
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
