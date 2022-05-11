import { Model, Schema, model } from "mongoose";
import { User } from "../types/User";

interface UserModel extends Model<User> {}

const UserSchema = new Schema<User, UserModel, {}, {}>(
  {
    method: {
      type: String,
      required: true,
      enum: ["DISCORD"],
      default: "DISCORD",
    },
    discordID: {
      type: String,
      unique: true,
      required: true,
    },
    username: {
      type: String,
      required: true,
      maxlength: 20,
    },
    discriminator: {
      type: String,
      required: true,
      maxlength: 4,
    },
    avatar: {
      type: String,
      maxlength: 100,
    },
    name: {
      type: String,
      required: true,
      maxlength: 100,
      default: function () {
        return this.username;
      },
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    insta: {
      type: String,
      maxlength: 50,
    },
    website: {
      type: String,
      maxlength: 100,
    },
    events: [
      {
        type: {
          id: {
            type: Schema.Types.ObjectId,
            ref: "Event",
            required: true,
          },
          status: {
            type: String,
            required: true,
            enum: ["PLANNED", "REQUESTED", "APPROVED", "DENIED"],
          },
          notes: {
            type: String,
            maxlength: 500,
          },
        },
        _id: false,
      },
    ],
    discordAccessToken: {
      type: String,
      maxlength: 100,
    },
    discordAccessTokenExpiry: {
      type: Date,
    },
    discordRefreshToken: {
      type: String,
      maxlength: 100,
    },
    refreshTokens: [
      {
        type: String,
        maxlength: 500,
      },
    ],
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

const UserModel = model<User, UserModel>("User", UserSchema);

export default UserModel;
