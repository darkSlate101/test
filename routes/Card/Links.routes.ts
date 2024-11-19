import { Router } from "express";
import { 
    create, 
    get, 
    update, 
    deleteOne 
} from "../../controllers/Cards/Link.controllers";

const router = Router();



router.route("/")
    .post(create)
    
router.route('/:id')
    .get(get)
    .put(update)
    .delete(deleteOne);



export default router;