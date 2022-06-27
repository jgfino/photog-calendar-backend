import express from "express";
import * as discover from "../controllers/discoverController";

// Deal with looking at events from Ticketmaster

const router = express.Router();

router.get("/events", discover.getEvents);

router.get("/events/:id", discover.getEvent);

export default router;
