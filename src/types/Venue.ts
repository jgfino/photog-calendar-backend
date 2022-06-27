export enum VenueType {
  CUSTOM = "CUSTOM",
  TICKETMASTER = "TICKETMASTER",
}

export interface Venue {
  name: string;
  city: string;
  state: string;
  address: string;
  postalCode: string;
  type: VenueType;
}

export interface TicketmasterVenue extends Venue {
  ticketmasterID: string;
}
