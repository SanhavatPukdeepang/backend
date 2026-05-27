import ApiError from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
  let { status, message, details } = err;

  if (!(err instanceof ApiError)) {
    // If it's not an ApiError, it might be a Mongoose error or something else
    status = err.status || 500;
    message = err.message || "Internal Server Error";
  }

  console.error(`[ERROR] ${req.method} ${req.originalUrl}: ${message}`);
  if (err.stack && process.env.NODE_ENV !== 'production') {
    // console.error(err.stack);
  }

  res.status(status).json({
    success: false,
    message,
    details: details || null,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

export default errorHandler;
