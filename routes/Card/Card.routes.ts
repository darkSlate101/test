import AttachmentRoutes from './Attachments.routes';
import LinkRoutes from './Links.routes';
import { Router } from "express";
import { 
    create, 
    get, 
    update, 
    deleteOne,
    getHistory
} from "../../controllers/Cards/Card.controllers";
import { verifyToken } from "../../middlewares/auth";

const router = Router();



router.post("/", verifyToken,  create);
router.get("/", verifyToken,  get);

router.get('/:id/history', verifyToken, getHistory);
router.use('/attachment', verifyToken, AttachmentRoutes);
router.use('/link', verifyToken, LinkRoutes);
    
router.route('/:id')
    .put(verifyToken, update)
    .delete(verifyToken, deleteOne);



export default router;