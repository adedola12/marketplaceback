import express from "express";
import {
  google,
  signOut,
  signin,
  signup,
  refresh,
} from "../controllers/auth.controller.js";
import { verifyRefreshToken, verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/sign-up", signup);
router.post("/sign-in", signin);
router.post("/google", google);
router.get("/signout", signOut);
router.get("/refresh", verifyRefreshToken, refresh);

export default router;
