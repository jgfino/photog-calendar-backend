import { Model, Schema, model } from "mongoose";
import { CustomEvent } from "../types/Event";

interface CustomEventModel extends Model<CustomEvent> {}

const CustomEventSchema = new Schema<CustomEvent, CustomEventModel, {}, {}>(
  {
    name: {
      type: String,
      required: true,
      maxlength: 200,
    },
    venueName: {
      type: String,
      required: true,
      maxlength: 200,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  {
    toJSON: {
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

const CustomEventModel = model<CustomEvent, CustomEventModel>(
  "CustomEvent",
  CustomEventSchema
);

export default CustomEventModel;
