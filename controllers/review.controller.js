import Product from "../models/product.model.js";
import Review from "../models/review.model.js";
import errorHandler from "../utils/error.js";
import User from "../models/user.model.js";
import { isValidObjectId } from "mongoose";

//POST:: create new product review.
export const createProductReview = async (req, res, next) => {

    const { name, email, rating, message, seller } = req.body;
  
    const userId = req.user?.id;

    if(!userId) {
        return next(errorHandler(400, "Unauthorized, please login"));
    }

    if(!isValidObjectId(userId)) {
        return next(errorHandler(400, "Invalid user ID"));
    }

    try {
        
        const userExist = await User.findById(userId);

        if(!userExist) {
            return next(errorHandler(404, "User not found"));
        }

        const sellerExist = await User.findById(seller);

        if(!sellerExist) {
            return next(errorHandler(404, "Seller not found"));
        }

        if(userId === seller) {
            return next(errorHandler(400, "You are not allowed to review yourself"));
        }

        const data = {
            name,
            rating, 
            email,
            product: seller, 
            comment: message, 
            user: userId,
            seller
        }

        const review = new Review(data);
        await review.save();


        sellerExist.reviews.push(review);
        await sellerExist.save();


      return res.status(201).json({ message: "Review created"});
  
    } catch (error) {
      next(error);
    }
};
  
//GET:: fetch all reviews by a particular product ID.
export const fetchAllProductReviews = async (req, res, next) => {

   const { productId } = req.params;
  


    try {
        
        // const product = await Product.findById(productId).populate({
        //     path: 'reviews',
        //     model: 'Review',
        //     select: 'comment rating user',
        //     populate: {
        //       path: 'user',
        //       model: 'User',
        //       select: 'name email'
        //     }
        //   });

        // if(!product) {
        //     return next(errorHandler(401, "Product not found"));
        // }

        const reviews = await Review.find({ product: productId })
                        .populate({
                            path: 'product',
                            model: 'Product',
                            select: 'name',
                        })
                        .populate({
                            path: 'user',
                            model: 'User',
                            select: 'name avatar',
                        })


   
                        
        if(!reviews) {
            return next(errorHandler(401, "Product not found"));
        }


      return res.status(201).json({ reviews });
  
    } catch (error) {
      next(error);
    }
};
  