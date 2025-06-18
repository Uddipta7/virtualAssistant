import express from "express";
import { askToAssistant, getCurrentUser, updateAssistant } from "../controllers/user.controllers.js";
import isAuth from "../middlewares/isAuth.js";

const userRouter = express.Router();

userRouter.get("/current", isAuth, getCurrentUser);
userRouter.post("/update", isAuth, updateAssistant);
userRouter.post("/asktoassistant", isAuth, askToAssistant);

export default userRouter;