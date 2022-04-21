import { Model, Schema, model } from "mongoose";
import { User } from "../types/User";

interface UserModel extends Model<User> {}

const UserSchema = new Schema<User, UserModel, {}, {}>(
  {
    id: {
      type: String,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: true,
      maxlength: 100,
    },
    tmEvents: [
      {
        type: String,
      },
    ],
    customEvents: [
      {
        type: Schema.Types.ObjectId,
        ref: "CustomEvent",
      },
    ],
  },
  {
    _id: false,
    toJSON: {
      transform: (_, ret) => {
        delete ret.__v;
      },
    },
  }
);

const UserModel = model<User, UserModel>("User", UserSchema);

export default UserModel;
