import { Router } from "express";
import { 
    create, 
    get, 
    update, 
    deleteOne, 
    reply, 
    getPins 
} from "../controllers/CommonLogs.controllers";
import { verifyToken } from "../middlewares/auth";

const router = Router();

router.route("/:id")
    .post(verifyToken, create)
    .put(verifyToken, update)
    .delete(verifyToken, deleteOne);

    
router.route("/:id/reply").put(verifyToken, reply);
router.get('/pins', verifyToken, getPins);


router.get('/:id', verifyToken, get);



export default router;