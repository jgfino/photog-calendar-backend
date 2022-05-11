/**
 * Basic information for an event stored in the database
 */
export interface Event {
  name: string;
  venueName: string;
  date: Date;
  type: "CUSTOM" | "TICKETMASTER";
  venueId?: string;
  notes?: string;
}

/**
 * Additional information for an event retrieved from the Ticketmaster API
 */
export interface TicketmasterEvent extends Event {
  tickemasterID: string;
  photo?: string;
  venueId: string;
}
