import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import CustomEventModel from "./schema/CustomEventSchema";
import UserModel from "./schema/UserSchema";
import events from "./routes/eventRoutes";
import mongoose from "mongoose";

dotenv.config();

const app = express();

const db = {
  mongoose: mongoose,
  url: process.env.MONGODB_URL,
  users: UserModel,
  customEvents: CustomEventModel,
};

db.mongoose
  .connect(db.url!)
  .then(() => console.log("Connected to MongoDB"))
  .catch((e) => console.log("Cannot connect to MongoDB: " + e));

app.use(express.urlencoded({ extended: false }));

app.use("/api/events", events);

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
