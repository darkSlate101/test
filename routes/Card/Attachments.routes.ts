import { Router } from "express";
import { 
    create, 
    get, 
    update, 
    deleteOne 
} from "../../controllers/Cards/Attachment.controllers";

const router = Router();



router.route("/:cardId")
    .post(create)
    .get(get);
    
router.route('/:cardId/:id')
    .put(update)
    .delete(deleteOne);



export default router;