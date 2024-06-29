import jwt from "jsonwebtoken";
import errorHandler from "./error.js";
import appConstants from "../constants/index.js";
import User from "../models/user.model.js";

export const verifyToken = async (req, res, next) => {
  
  const access_token = req.cookies["access_token"];

  if (!access_token) {
    return next(errorHandler(401, "Unauthorized Request"));
  }


  try {

    const decoded =  jwt.verify(access_token, appConstants.JWT_SECRET);

    if(!decoded) {
      return next(errorHandler(401, "Unauthorized token"));
    }

    const user = await User.findById(decoded?.id);
   
    if(!user) {
      return next(errorHandler(401, "Unauthorized user"));
    }

    const { password, ...rest } = user._doc;
    req.user = rest;
    next();

  } catch (error) {
    if(error instanceof jwt.TokenExpiredError) {
      return next(errorHandler(401, "jwt expired"));
    } else if(error instanceof jwt.JsonWebTokenError) {
      return next(errorHandler(401, "jwt expired"));
    }
    return next(errorHandler(404, "Forbidden Request"));
  }
};


export const verifyRefreshToken = async (req, res, next) => {

  const refresh_token = req.cookies["refresh_token"];

  if(!refresh_token) {
    return next(errorHandler(401, "Unauthorized Request"));
  }

  try {

    const decoded = jwt.verify(refresh_token, appConstants.JWT_REFRESH_TOKEN_SECRET);

    if(!decoded) {
      return next(errorHandler(401, "Unauthorized token"));
    }

    const user = await User.findById(decoded?.id);

    if(!user) {
      return next(errorHandler(401, "Unauthorized user"));
    }

    const { password, ...rest } = user._doc;
    req.user = rest;

    next();

  } catch (error) {
      if(error instanceof jwt.TokenExpiredError) {
        return next(errorHandler(401, "jwt expired"));
      } else if(error instanceof jwt.JsonWebTokenError) {
        return next(errorHandler(401, "jwt expired"));
      }
      return next(errorHandler(404, "Forbidden Request"));
    }

}