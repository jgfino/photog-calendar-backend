import { catchAsync } from "../error/catchAsync";
import EventModel from "../schema/EventSchema";

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

export const createEvent = catchAsync(async (req, res, next) => {
  const { name, venueName, date, type, venueId, notes, ticketmasterID, photo } =
    req.body;

  if (type == "CUSTOM") {
    const exists = await EventModel.find({
      $and: [
        { date: date },
        { $or: [{ venueName: venueName }, { name: name }] },
      ],
    });
    if (exists) {
      return res
        .status(200)
        .send({ message: "Duplicate event", event: exists });
    }

    const newEvent = await EventModel.create({
      name,
      venueName,
      date,
      type,
      venueId,
      notes,
    });
    res
      .status(200)
      .send({ message: "Event created successfully", event: newEvent });
  } else if (type == "TICKETMASTER") {
    const exists = await EventModel.find({ tickemasterID: ticketmasterID });
    if (exists) {
      return res
        .status(200)
        .send({ message: "Duplicate event", event: exists });
    }
    const newEvent = await EventModel.create({
      name,
      venueName,
      date,
      type,
      venueId,
      notes,
      ticketmasterID,
      photo,
    });
    res
      .status(200)
      .send({ message: "Event created successfully", event: newEvent });
  }
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
