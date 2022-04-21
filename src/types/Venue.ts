export interface Venue {
  id: string;
  name: string;
}

export interface TicketmasterVenue extends Venue {
  city: string;
  state: string;
  address: string;
  postalCode: string;
}
