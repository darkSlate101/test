import { Router } from "express";
import { get, read, deleteOne } from "../controllers/Notifications.controllers";
import { verifyToken } from "../middlewares/auth";

const router = Router();

router.get('/', verifyToken, get);
router.get('/read/:id', verifyToken, read);
router.delete('/:id', verifyToken, deleteOne);



export default router;