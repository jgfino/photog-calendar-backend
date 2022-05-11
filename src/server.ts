import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import EventModel from "./schema/EventSchema";
import UserModel from "./schema/UserSchema";
import events from "./routes/eventRoutes";
import auth from "./routes/authRoutes";
import mongoose from "mongoose";
import passport from "passport";
import { Strategy as JWTStrategy, StrategyOptions } from "passport-jwt";
import { ExtractJwt } from "passport-jwt";
import { User as AppUser } from "./types/User";
import "./cron";

dotenv.config();

declare global {
  namespace Express {
    interface User extends AppUser {
      id: string;
    }
  }
}

const jwtOpts: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  "jwt",
  new JWTStrategy(jwtOpts, async (payload, done) => {
    try {
      const user: AppUser & { id: string; _id?: string } =
        await UserModel.findById(payload.userID).lean();
      if (!user) {
        throw new Error("No user found with this ID");
      }
      user.id = user?._id!.toString();
      delete user._id;
      console.log(user);
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

const app = express();

const db = {
  mongoose: mongoose,
  url: process.env.MONGODB_URL,
  users: UserModel,
  customEvents: EventModel,
};

db.mongoose
  .connect(db.url!)
  .then(() => console.log("Connected to MongoDB"))
  .catch((e) => console.log("Cannot connect to MongoDB: " + e));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(passport.initialize());

export const jwtAuth = passport.authenticate("jwt", { session: false });

app.use("/api/auth", auth);
app.use("/api/events", jwtAuth, events);

app.use("/", jwtAuth, async (req, res, next) => {
  res.send(`Hello, ${req.user?.name}`);
});

// Route not found
app.all("*", (req, res, next) => {
  res.status(404).send("Route not found");
});

// Generic error wrapping
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  res.status(500).send("An internal server error occured");
});

// Start app and build initial database
app.listen(process.env.PORT, () => {
  console.log(`Express listening on port ${process.env.PORT}`);
});
