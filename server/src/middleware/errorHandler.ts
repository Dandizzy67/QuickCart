// errorHandler.ts
// the last middleware: turns ANY error thrown in a route into a JSON reply with the right status code, so the server never

import { json, NextFunction, Request, Response } from "express";
import { AppError } from "../utils/apperror";
import mongoose from "mongoose";

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction, // not used, but express only trats a middleware as an error handler when it has 4 parameters
) => {
  // 1.
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  if (error instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(error.errors).map((field) => {
      return field.message;
    });

    return res.status(400).json({ messages: messages.join(" . ") });
  }

  //   3. A badly formed id, e.g Get
  if (error instanceof mongoose.Error.CastError) {
    return res
      .status(400)
      .json({ message: `Invalid ${error.path} : ${String(error.value)}` });
  }

  const err = error as {
    code?: number;
    keyValue?: Record<string, unknown>;
    type?: string;
    name?: string;
  };

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? "values";
    return res
      .status(409)
      .json({ message: `That ${field} is  already in use` });
  }

  if (err.type === "entity.parse.failed") {
    return res
      .status(400)
      .json({ message: "The request body is not valid JSON" });
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res
      .status(401)
      .json({ message: "Your session has expired. Please log in again." });
  }

  console.error(error);
  return res
    .status(500)
    .json({ message: "Something went wrong on our side. Please try again" });
};
