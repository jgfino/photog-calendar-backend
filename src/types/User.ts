import { Types } from "mongoose";

export interface User {
  id: string;
  name: string;
  tmEvents: Array<string>;
  customEvents: Array<Types.ObjectId>;
}

export interface DiscordUser extends User {
  username: string;
  discriminator: string;
  avatar?: string;
}
