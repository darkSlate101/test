import { Router } from "express";
import { create, get, update, deleteOne } from "../controllers/Tag.controllers";
import { verifyToken } from "../middlewares/auth";

const router = Router();

router.post("/", verifyToken, create);
router.get('/', verifyToken, get);
router.put('/:id', verifyToken, update);
router.delete('/:id', verifyToken, deleteOne);



export default router;