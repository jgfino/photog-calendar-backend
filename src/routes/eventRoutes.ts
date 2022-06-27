import express from "express";
import * as events from "../controllers/eventController";

// Deal with looking at events saved in the database (that at least one person is shooting)

const router = express.Router();

// Get events and filtering

router.get("/", events.getEvents);

// A photog planned an event

router.post("/", events.createEvent);

// Get event details, including photogs
router.get("/:id", events.getEvent);

export default router;
