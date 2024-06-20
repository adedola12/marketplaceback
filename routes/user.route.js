import express from "express";
import {
  deleteUser,
  getSellerProductAndReviews,
  getUser,
  getUserListings,
  getUserProduct,
  productUserDetails,
  test,
  updateUser,
} from "../controllers/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.get("/test", test);
router.post("/update/:id", verifyToken, updateUser);
router.delete("/delete/:id", verifyToken, deleteUser);
router.get("/listings/:id", verifyToken, getUserListings);
router.get("/products/:id", verifyToken, getUserProduct);
router.get("/:id", verifyToken, getUser);
router.get("/seller/:sellerId", verifyToken, getSellerProductAndReviews);

router.get("user/:id", productUserDetails);

export default router;
