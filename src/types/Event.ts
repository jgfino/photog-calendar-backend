import { Types } from "mongoose";
import { TicketmasterVenue, Venue } from "./Venue";

export enum EventType {
  CUSTOM = "CUSTOM",
  TICKETMASTER = "TICKETMASTER",
}

/**
 * Basic information for an event stored in the database
 */
export interface Event {
  name: string;
  date: Date;
  type: EventType;
  venueID: Types.ObjectId;
  notes?: string;
  lineup: string[];
}

/**
 * Additional information for an event retrieved from the Ticketmaster API
 */
export interface TicketmasterEvent extends Event {
  ticketmasterID: string;
  photo?: string;
}

export type EventResponse = Exclude<Event | TicketmasterEvent, "venue"> & {
  venue: Venue | TicketmasterVenue;
};
