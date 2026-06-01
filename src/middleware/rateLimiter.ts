import rateLimit from "express-rate-limit";

const standardOptions = {
  standardHeaders: true,
  legacyHeaders: false,
};

export const authRateLimiter = rateLimit({
  ...standardOptions,
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: {
    error: "Too many authentication requests, please try again later.",
  },
});

export const cropRateLimiter = rateLimit({
  ...standardOptions,
  windowMs: 60 * 1000,
  limit: 10,
  message: {
    error: "Too many crop analysis requests, please try again later.",
  },
});
