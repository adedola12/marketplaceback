import User from "../models/user.model.js";
import Listing from "../models/listing.model.js";
import Product from "../models/product.model.js";
import Review from "../models/review.model.js";
import errorHandler from "../utils/error.js";
import { isValidObjectId } from "mongoose";

export const test = (req, res) => {
  res.json({ message: "API Route is working!" });
};

export const updateUser = async (req, res, next) => {
  const userId = req?.user?._id.toString();

  if (!userId) {
    return next(errorHandler(404, "User ID not found"));
  }

  if (userId !== req.params.id)
    return next(errorHandler(401, "You can only update your own account"));
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          avatar: req.body.avatar,
          bio: req.body.bio,
          storeAddress: req.body.storeAddress,
          mobileNumber: req.body.mobileNumber,
        },
      },
      { new: true }
    );

    const { password, ...rest } = updatedUser._doc;

    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (!req.user._id.toString()) {
    return next(errorHandler(401, "Please login"));
  }

  if (req.user._id.toString() !== req.params.id) {
    return next(errorHandler(401, "You can only delete your own account"));
  }

  try {
    await Product.deleteMany({ userRef: req.user._id.toString() });
    await Listing.deleteMany({ userRef: req.user._id.toString() });
    await Review.deleteMany({ userRef: req.user._id.toString() });
    await User.findByIdAndDelete(req.params.id);

    res.clearCookie("access_token", "", { expires: new Date(0) });
    res.clearCookie("refresh_token", "", { expires: new Date(0) });

    res.status(200).json(null);
  } catch (error) {
    next(error);
  }
};

export const getUserListings = async (req, res, next) => {
  if (req.user._id.toString() !== req.params.id) {
    return next(errorHandler(401, "You can only view your own listings!"));
  }

  try {
    const listings = await Listing.find({ userRef: req.params.id });
    res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};

export const getSellerProductAndReviews = async (req, res, next) => {
  const { sellerId } = req.params;
  try {
    const user = await User.findById(sellerId).populate({
      path: "reviews",
      model: "Review",
      select: "comment rating",
    });

    if (!user) {
      return next(errorHandler(404, "User not found!"));
    }

    const { password: pass, ...rest } = user._doc;

    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    if (!req.params.id) {
      return next(errorHandler(404, "Invalid user ID!"));
    }

    if (!isValidObjectId(req.params.id)) {
      return next(errorHandler(404, "Invalid user ID!"));
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return next(errorHandler(404, "User not found!"));
    }

    const { password: pass, ...rest } = user._doc;

    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const productUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(errorHandler(404, "User not found!"));
    }

    const { password: pass, ...rest } = user._doc;

    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const getUserProduct = async (req, res, next) => {
  if (req.user._id.toString() !== req.params.id) {
    return next(errorHandler(401, "You can only view your own product!"));
  }

  try {
    const products = await Product.find({ userRef: req.params.id });
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};
