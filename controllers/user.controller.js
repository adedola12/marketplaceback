import bcryptjs from "bcryptjs";
import errorHandler from "../utils/error.js";
import User from "../models/user.model.js";
import Listing from "../models/listing.model.js";
import Product from "../models/product.model.js";
import { isValidObjectId } from "mongoose";

export const test = (req, res) => {
  res.json({
    message: "API Route is working!",
  });
};

export const updateUser = async (req, res, next) => {

  const userId = req?.user?.id;

  if(!userId) {
    return next(errorHandler(401, "Please login"));
  }

  if (userId !== req.params.id)
    return next(errorHandler(401, "You can only update your own account"));
  try {

    // if (req.body.password) {
    //   req.body.password = bcryptjs.hashSync(req.body.password, 10);
    // }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          avatar: req.body.avatar,
          bio: req.body.bio,
          // storeAddress: req.body.storeAddress,
          // mobileNumber: req.body.mobileNumber,
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
  
  if (!req.user.id) {
    return next(errorHandler(401, "Please login"));
  }

  if (req.user.id !== req.params.id) {
    return next(errorHandler(401, "You can only delete your own account"));
  }

  try {
    await User.findByIdAndDelete(req.params.id);
    res.clearCookie("access_token");
    res.status(200).json("User has been deleted!");
  } catch (error) {
    next(error);
  }
};

export const getUserListings = async (req, res, next) => {
  if (req.user.id === req.params.id) {
    try {
      const listings = await Listing.find({ userRef: req.params.id });
      res.status(200).json(listings);
    } catch (error) {
      next(error);
    }
  } else {
    return next(errorHandler(401, "You can only view your own listings!"));
  }
};

export const getSellerProductAndReviews = async (req, res, next) => {
  const { sellerId } = req.params;
  try {

    const user = await User.findById(sellerId).populate({
      path: "reviews",
      model: "Review",
      select: "comment rating"
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

    if(!req.params.id) {
      return next(errorHandler(404, "Invalid user ID!"));
    }
    
    if(!isValidObjectId(req.params.id)) {
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
  if (req.user.id === req.params.id) {
    try {
      const products = await Product.find({ userRef: req.params.id });
      res.status(200).json(products);
    } catch (error) {
      next(error);
    }
  } else {
    return next(errorHandler(401, "You can only view your own product!"));
  }
};
