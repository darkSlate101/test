import { Router } from "express";
import { 
    create, 
    get, 
    update, 
    deleteOne,
    invite,
    acceptInvite,
    requestAccess,
    grantAccess
} from "../controllers/Roadmap.controllers";
import { verifyToken } from "../middlewares/auth";

const router = Router();



router.post("/", verifyToken, create);
router.get('/', verifyToken, get);


// Access
router.post('/invite/:id', verifyToken, invite);
router.get('/requestAccess/:id', verifyToken, requestAccess);
router.get('/grantAccess/:id/:memberId', verifyToken, grantAccess);
router.get('/acceptInvite/:id', verifyToken, acceptInvite);


router.route('/:id')
    .put(verifyToken, update)
    .delete(verifyToken, deleteOne)    



export default router;