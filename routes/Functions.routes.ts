import { Router } from "express";
import { get, update} from "../controllers/Functions.controllers";
import { verifyToken } from "../middlewares/auth";

const router = Router();

router.put("/", verifyToken, update);
router.get('/', verifyToken, get);


export default router;