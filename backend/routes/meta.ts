import express from "express";
import asyncHandler from "express-async-handler";

const metaRouter = express.Router();

metaRouter.post(
  "/test",
  asyncHandler(async (req, res) => {
    res.json({
      message: "Hello from Express!",
      status: "success",
    });
  })
);

export default metaRouter;
