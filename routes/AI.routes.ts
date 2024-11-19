import { Router } from "express";
import { chatGPT } from "../controllers/AI.controllers";
import { verifyToken } from "../middlewares/auth";

const router = Router();

router.post("/chatGPT", verifyToken, chatGPT);



export default router;