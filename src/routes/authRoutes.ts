import express from "express";
import * as auth from "../controllers/authController";

const router = express.Router();

router.post("/login", auth.loginOrCreate);

router.post("/token", auth.tokens);

router.post("/logout", auth.logOut);

export default router;
