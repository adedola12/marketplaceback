import Review from "../models/review.model.js";
import errorHandler from "../utils/error.js";
import User from "../models/user.model.js";
import { isValidObjectId } from "mongoose";

//POST:: create new product review.
export const createProductReview = async (req, res, next) => {
  const { name, email, rating, message, sellerId } = req.body;

  const userId = req.user?._id.toString();

  if (!userId) {
    return next(errorHandler(400, "Unauthorized, please login"));
  }

  if (!isValidObjectId(sellerId)) {
    return next(errorHandler(400, "Invalid seller ID"));
  }

  if (!isValidObjectId(userId)) {
    return next(errorHandler(400, "Invalid user ID"));
  }

  try {
    const userPromise = User.findById(userId);
    const sellerPromise = User.findById(sellerId);

    const [user, seller] = await Promise.all([userPromise, sellerPromise]);

    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    if (!seller) {
      return next(errorHandler(404, "Seller not found"));
    }

    if (userId === sellerId) {
      return next(errorHandler(400, "You are not allowed to review yourself"));
    }

    // if(seller.reviews.includes(userId)) {
    //     return next(errorHandler(400, "You already reviewed the seller"));
    // }

    const data = {
      name,
      rating,
      email,
      product: sellerId,
      comment: message,
      user: userId,
      seller: sellerId,
    };

    const review = new Review(data);
    await review.save();

    seller.reviews.push(review);
    await seller.save();

    return res.status(201).json({ message: "Review created" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//GET:: fetch all reviews by a particular product ID.
export const fetchAllProductReviews = async (req, res, next) => {
  const { productId } = req.params;

  try {
    const reviews = await Review.find({ product: productId })
      .populate({
        path: "product",
        model: "Product",
        select: "name",
      })
      .populate({
        path: "user",
        model: "User",
        select: "name avatar",
      });

    if (!reviews) {
      return next(errorHandler(401, "Product not found"));
    }

    return res.status(201).json({ reviews });
  } catch (error) {
    next(error);
  }
};

//GET:: fetch all reviews by a particular product ID.
export const fetchAllSellerReviews = async (req, res, next) => {
  const { sellerId } = req.params;

  try {
    const reviews = await Review.find({ seller: sellerId })
      .populate({
        path: "seller",
        model: "User",
        select: "name avatar",
      })
      .select("-product -user")
      .sort({ createdAt: -1 });

    if (!reviews) {
      return next(errorHandler(401, "No reviews for this seller"));
    }

    return res.status(200).json({ reviews });
  } catch (error) {
    next(error);
  }
};

//GET:: fetch all reviews by a particular product ID.
export const fetchAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({})
      .populate({
        path: "seller",
        model: "User",
        select: "username avatar",
      })
      .select("-product -user -updatedAt")
      .sort({ createdAt: -1 });

    if (!reviews) {
      return next(errorHandler(401, "No reviews for this seller"));
    }

    return res.status(200).json({ reviews });
  } catch (error) {
    next(error);
  }
};
