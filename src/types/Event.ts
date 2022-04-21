import { Types } from "mongoose";

export interface TicketmasterEvent {
  id: string;
  name: string;
  photo?: string;
  venueId: string;
  venueName: string;
  date: Date;
}

export interface CustomEvent {
  _id: Types.ObjectId;
  name: string;
  venueName: string;
  date: Date;
}
