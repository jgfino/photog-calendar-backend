import * as ticketmaster from "../api/ticketmaster";
import { catchAsync } from "../error/catchAsync";
import CustomEventModel from "../schema/CustomEventSchema";
import UserModel from "../schema/UserSchema";
import { CustomEvent, TicketmasterEvent } from "../types/Event";
import { DiscordUser, User } from "../types/User";
import { HydratedDocument } from "mongoose";

export const getEvent = catchAsync(async (req, res, next) => {
  const json: {
    custom?: boolean;
    event?: CustomEvent | TicketmasterEvent;
    photographers?: DiscordUser[];
  } = {};

  let event: HydratedDocument<CustomEvent> | TicketmasterEvent | null = null;
  let photogs: HydratedDocument<User>[];

  if (req.query.custom) {
    json.custom = true;
    event = await CustomEventModel.findById(req.params.id);
    photogs = await UserModel.find({ customEvents: event?.id });
  } else {
    json.custom = false;
    event = await ticketmaster.getEventDetails(req.params.id);
    photogs = await UserModel.find({ tmEvents: event?.id });
  }

  if (!event) {
    return res.status(404).send("Event not found");
  }

  // Get data from discord

  // @ts-ignore
  json.photographers = photogs;
  json.event = event;

  res.status(200).send(json);
});

export const getEvents = catchAsync(async (req, res, next) => {
  const json: {
    tmEvents?: TicketmasterEvent[];
    customEvents?: CustomEvent[];
    photographers?: DiscordUser[];
  } = {};

  let tmEvents;
  if (req.query.month) {
    tmEvents = await ticketmaster.getEventsAtVenuesByMonth(5);
    if (!tmEvents) {
      return res.status(404).send("No events found");
    }
  }

  json.tmEvents = tmEvents;

  res.status(200).send(json);
});
