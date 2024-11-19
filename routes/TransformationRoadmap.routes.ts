import { Router } from "express";
import { 
    create, 
    get, 
    update, 
    deleteOne, 
    publish, 
    restrictions, 
    moveElement 
} from "../controllers/TransformationRoadmap.controllers";
import { verifyToken } from "../middlewares/auth";

const router = Router();

router.post("/", verifyToken, create);
router.get('/', verifyToken, get);
router.put('/:id', verifyToken, update);
router.get('/publish/:id', verifyToken, publish);
router.post('/restrictions/:id', verifyToken, restrictions);
router.delete('/:id', verifyToken, deleteOne);
router.get('/move/:id', verifyToken, moveElement);



export default router;