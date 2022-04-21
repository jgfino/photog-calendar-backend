import express from "express";
import * as events from "../controllers/eventController";

const router = express.Router();

router.get("/", events.getEvents);

router.get("/:id", events.getEvent);

export default router;
