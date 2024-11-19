import { Router } from "express";
import { create, getHistory, deleteMany } from "../controllers/Chat.controllers";
import { verifyToken } from "../middlewares/auth";


const router = Router();

router.post("/", verifyToken, create);
router.get('/history', verifyToken, getHistory);
router.delete('/delete', verifyToken, deleteMany);


export default router;