import { Router } from "express";
import { 
    create, 
    get, 
    update, 
    deleteOne,
    invite,
    acceptInvite,
    getColumns,
    createAssessment,
    requestAccess,
    grantAccess,
    updateColumn,
    deleteColumn,
    createColumn,
    requestDOJOSuggestions,
    getSuggestions,
    deleteDOJOSuggestion
} from "../controllers/ProgressBoard.controllers";
import { verifyToken } from "../middlewares/auth";

const router = Router();



router.post("/", verifyToken, create);
router.get('/', verifyToken, get);


// Access
router.post('/invite/:id', verifyToken, invite);
router.get('/requestAccess/:id', verifyToken, requestAccess);
router.get('/grantAccess/:id/:memberId', verifyToken, grantAccess);
router.get('/acceptInvite/:id', verifyToken, acceptInvite);

router.route('/columns').post(verifyToken, createColumn);
router.route('/columns').get(verifyToken, getColumns);
router.route('/columns/:id').put(verifyToken, updateColumn);
router.route('/columns/:id').delete(verifyToken, deleteColumn);

router.post('/assessment/:id', verifyToken, createAssessment);

router.get('/:id/getDOJOSuggestions', verifyToken, getSuggestions);
router.get('/:id/requestDOJOSuggestions', verifyToken, requestDOJOSuggestions);
router.delete('/:id/deleteDOJOSuggestion', verifyToken, deleteDOJOSuggestion);


router.route('/:id')
    .put(verifyToken, update)
    .delete(verifyToken, deleteOne)    



export default router;