import express from "express";
import * as user from "../controllers/profileController";

// Deal with user profile info and requested show managing

const router = express.Router();

router.patch("/", user.editProfile);

router.get("/:id", user.getProfile);

router.get("/", user.getProfile);

// router.post("/events", user.planEvent);

// router.get("/events", user.getPlannedEvents);

export default router;
