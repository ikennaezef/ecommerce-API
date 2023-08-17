import { Router } from "express";
import {
	changePassword,
	getAllUsers,
	getUser,
	searchUser,
} from "../controllers/userControllers";
import { checkAuthorization, checkAdmin } from "../middleware/auth";

const router = Router();

router.get("/", checkAuthorization, checkAdmin, getAllUsers);
router.post("/change-password", checkAuthorization, changePassword);
router.get("/search", checkAuthorization, checkAdmin, searchUser);
router.get("/:id", checkAuthorization, getUser);

export default router;
