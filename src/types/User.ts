import { Types } from "mongoose";

export enum EventStatus {
  PLANNED = "PLANNED",
  REQUESTED = "REQUESTED",
  APPROVED = "APPROVED",
  DENIED = "DENIED",
}

/***
 * An event planned by a user and whether it has been requested
 */
interface PlannedEvent {
  id: Types.ObjectId;
  status: EventStatus;
  notes: string;
}

/**
 * User information stored in the database. Fetches data from Discord
 * every hour to update fields related to a user's discord account
 */
export interface User {
  name: string;

  refreshTokens: Array<string>;

  events: Array<PlannedEvent>;
  method: "DISCORD";

  bio?: string;
  insta?: string;
  website?: string;

  discordID: string;
  username: string;
  discriminator: string;
  avatar?: string;

  discordAccessToken: string;
  discordAccessTokenExpiry: Date;
  discordRefreshToken: string;
}
