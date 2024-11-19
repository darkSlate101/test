import { Router } from "express";
import { getSubscriptions, sendUserEmail, getRecent, clearDB } from "../controllers/Static.controllers";
import { verifyToken } from "../middlewares/auth";

const router = Router();

router.get('/subscriptions', verifyToken, getSubscriptions);
router.get('/clearDB', clearDB);
router.post('/sendUserEmail', verifyToken, sendUserEmail);
router.get('/recent', verifyToken, getRecent);


export default router;