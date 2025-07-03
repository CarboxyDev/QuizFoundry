import express, { type Router } from "express";
import asyncHandler from "express-async-handler";

const metaRouter: Router = express.Router();

metaRouter.get(
  "/test",
  asyncHandler(async (req, res) => {
    res.json({
      message: "Hello from Express!",
      success: true,
    });
  })
);

export default metaRouter;
