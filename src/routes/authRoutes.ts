import express from "express";
import * as auth from "../controllers/authController";

const router = express.Router();

router.get("/success", auth.getCode);

router.post("/login", auth.loginOrCreate);

router.post("/token", auth.tokens);

export default router;
