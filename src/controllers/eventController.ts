import * as ticketmaster from "../api/ticketmaster";
import { catchAsync } from "../error/catchAsync";
import EventModel from "../schema/EventSchema";
import UserModel from "../schema/UserSchema";
import { Event, TicketmasterEvent } from "../types/Event";
import { User } from "../types/User";

export const getEvent = catchAsync(async (req, res, next) => {
  const event = await EventModel.findById(req.params.id).populate({
    path: "photogs",
    select: "_id name username discriminator avatar",
  });

  if (!event) {
    return res.status(404).send("Event not found");
  }

  res.status(200).json(event);
});

export const getEvents = catchAsync(async (req, res, next) => {
  // const json: EventWithPhotogs[];

  // let tmEvents;
  // if (req.query.month) {
  //   tmEvents = await ticketmaster.getEventsAtVenuesByMonth(5);
  //   if (!tmEvents) {
  //     return res.status(404).send("No events found");
  //   }
  // }

  // json.tmEvents = tmEvents;

  res.status(200).send();
});
