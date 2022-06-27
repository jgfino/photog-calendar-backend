import { Model, Schema, model } from "mongoose";
import { Event, EventType, TicketmasterEvent } from "../types/Event";

interface EventModel extends Model<Event & TicketmasterEvent> {}

const EventSchema = new Schema<Event & TicketmasterEvent, EventModel, {}, {}>(
  {
    name: {
      type: String,
      required: true,
      maxlength: 200,
    },
    venueID: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Venue",
    },
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: EventType,
      required: true,
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    ticketmasterID: {
      type: String,
      maxlength: 100,
    },
    photo: {
      type: String,
      maxlength: 1000,
    },
    lineup: {
      type: [String],
      maxlength: 100,
      required: true,
      default: function () {
        return [this.name];
      },
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
    toObject: { virtuals: true },
  }
);

EventSchema.virtual("photogs", {
  ref: "User",
  foreignField: "events",
  localField: "_id",
});

const EventModel = model<Event & TicketmasterEvent, EventModel>(
  "Event",
  EventSchema
);

export default EventModel;
