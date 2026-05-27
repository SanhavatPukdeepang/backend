import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";

export const authUser = async (req, res, next) => {
  let token = req.cookies.accessToken;

  if (!token) {
    return next(new ApiError(401, "Access denied. No token!"));
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { user: { _id: decodedToken.userId } };
    next();
  } catch (error) {
    next(error);
  }
};
