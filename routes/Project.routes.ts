import { Router } from "express";
import { 
    create, 
    get, 
    update, 
    invite,
    acceptInvite,
    deleteOne, 
    requestAccess, 
    grantAccess,
    handleUserAccess,
    getMembers,
    removeAccess
} from "../controllers/Project.controllers";
import { verifyToken } from "../middlewares/auth";

const router = Router();

router.post("/", verifyToken, create);
router.get('/', verifyToken, get);
router.post('/invite/:id', verifyToken, invite);
router.get('/acceptInvite/:id', verifyToken, acceptInvite);
router.put('/:id', verifyToken, update);
router.delete('/:id', verifyToken, deleteOne);
router.get('/:id/requestAccess', verifyToken, requestAccess);
router.get('/:id/grantAccess/:memberId', verifyToken, grantAccess);
router.put('/:id/handleAccess/:userId', verifyToken, handleUserAccess);
router.get('/:id/members', verifyToken, getMembers);
router.put('/:id/removeAccess', verifyToken, removeAccess);


export default router;