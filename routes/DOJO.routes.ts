import { Router } from "express";
import { get, update } from "../controllers/DOJO.controllers";
import { verifyToken } from "../middlewares/auth";

const router = Router();

router.get('/', verifyToken, get);
router.put('/', verifyToken, update);



export default router;