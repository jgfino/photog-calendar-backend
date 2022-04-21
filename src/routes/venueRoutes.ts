import express from "express";

const router = express.Router();

/**
 * Get details about a venue
 */
router.get("/:id");

/**
 * Get events happening at a venue
 */
router.get("/:id/events");

export default router;
