import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  createProduct,
  deleteProduct,
  editProduct,
  getAllProductInCategory,
  getAllProductInSubCategory,
  getAllUserProduct,
  getCat,
  getCategories,
  getProduct,
  searchProduct,
  sellerProduct,
  updateProduct,
  marketSearch

} from "../controllers/product.controller.js";

const router = express.Router();

router.post("/create-product", verifyToken, createProduct);

router.delete("/delete/:id", verifyToken, deleteProduct);
router.get("/edit/:id", verifyToken, editProduct);
router.put("/update/:id", verifyToken, updateProduct);
router.get("/getCategories", getCategories);
router.get("/getCat", getCat);
router.get("/getProduct/category/:category", getAllProductInCategory);
router.get("/get/:id", getProduct);
router.get("/search", searchProduct);
router.get("/market-search", marketSearch);
router.get("/seller-products/:sellerId", sellerProduct);

router.get("/:categoryName/subcategories", getAllProductInSubCategory);

router.get("/user/:userId", getAllUserProduct);

export default router;
