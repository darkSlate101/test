import { Router } from "express";
import { create, get, deleteOne, addMembers } from "../controllers/Teams.controllers";
import { verifyToken } from "../middlewares/auth";

const router = Router();

router.post("/", verifyToken, create);
router.get('/', verifyToken, get);
router.post('/addMembers', verifyToken, addMembers);
router.delete('/:id', verifyToken, deleteOne);


export default router;