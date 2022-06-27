import { catchAsync } from "../error/catchAsync";
import * as ticketmaster from "../api/ticketmaster";

// By month, at venue, by time, ability to only be boston or not
export const getEvents = catchAsync(async (req, res, next) => {
  const events = await ticketmaster.getTicketmasterEvents(req.query);
  res.status(200).send(events);
});

// Specific tm event
export const getEvent = catchAsync(async (req, res, next) => {
  const event = await ticketmaster.getTicketmasterEvent(req.params.id);
  res.status(200).send(event);
});
