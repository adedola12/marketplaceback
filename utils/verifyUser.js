import jwt from "jsonwebtoken";
import errorHandler from "./error.js";
import appConstants from "../constants/index.js";
import User from "../models/user.model.js";

export const verifyToken = async (req, res, next) => {
  const access_token = req.cookies["access_token"];

  if (!access_token) {
    return next(errorHandler(401, "Unauthorized token is required"));
  }

  try {
    const decoded = jwt.verify(access_token, appConstants.JWT_SECRET);

    if (!decoded) {
      return next(errorHandler(401, "Unauthorized invalid token"));
    }

    const user = await User.findById(decoded?.id);

    if (!user && !user._id) {
      return next(errorHandler(401, "Unauthorized invalid user"));
    }

    const { password, ...rest } = user._doc;

    req.user = rest;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(errorHandler(401, "jwt expired"));
    } else if (error instanceof jwt.JsonWebTokenError) {
      return next(errorHandler(401, "jwt expired"));
    }
    return next(errorHandler(404, "Forbidden Request"));
  }
};

export const verifyRefreshToken = async (req, res, next) => {
  const refresh_token = req.cookies["refresh_token"];

  if (!refresh_token) {
    return next(errorHandler(401, "Unauthorized Request"));
  }

  try {
    const decoded = jwt.verify(
      refresh_token,
      appConstants.JWT_REFRESH_TOKEN_SECRET
    );

    if (!decoded) {
      return next(errorHandler(401, "Invalid refresh token"));
    }

    const user = await User.findById(decoded?.id);

    if (!user) {
      return next(errorHandler(401, "Unauthorized user"));
    }

    const { password, ...rest } = user._doc;
    req.user = rest;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(errorHandler(401, "jwt expired"));
    } else if (error instanceof jwt.JsonWebTokenError) {
      return next(errorHandler(401, "jwt expired"));
    }
    return next(errorHandler(404, "Forbidden Request"));
  }
};

export const refreshToken = async (req, res, next) => {
  const { refresh_token } = req.cookies;

  if (!refresh_token) {
    return next(errorHandler(401, "Refresh token not provided"));
  }

  try {
    const decoded = jwt.verify(
      refresh_token,
      appConstants.JWT_REFRESH_TOKEN_SECRET
    );

    if (!decoded) {
      return next(errorHandler(401, "Invalid refresh token"));
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return next(errorHandler(401, "Unauthorized user"));
    }

    const access_token = jwt.sign({ id: user.id }, appConstants.JWT_SECRET, {
      expiresIn: appConstants.JWT_ACCESS_TOKEN_TIMEOUT,
    });
    const new_refresh_token = jwt.sign(
      { id: user.id },
      appConstants.JWT_REFRESH_TOKEN_SECRET,
      { expiresIn: appConstants.JWT_REFRESH_TOKEN_TIMEOUT }
    );

    res.cookie("refresh_token", new_refresh_token, {
      httpOnly: true,
      path: "/",
      secure: true,
      sameSite: "none",
      expires: new Date(
        Date.now() + appConstants.REFRESH_TOKEN_COOKIES_TIMEOUT
      ),
    });

    res.cookie("access_token", access_token, {
      httpOnly: true,
      path: "/",
      secure: true,
      sameSite: "none",
      expires: new Date(Date.now() + appConstants.ACCESS_TOKEN_COOKIES_TIMEOUT),
    });

    return res
      .status(200)
      .json({ access_token, refresh_token: new_refresh_token });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(errorHandler(401, "Refresh token expired"));
    } else if (error instanceof jwt.JsonWebTokenError) {
      return next(errorHandler(401, "Invalid refresh token"));
    }
    return next(errorHandler(404, "Forbidden Request"));
  }
};
