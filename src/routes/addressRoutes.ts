import { Router } from "express";
import { checkAdmin, checkAuthorization } from "../middleware/auth";
import {
	createAddress,
	deleteAddress,
	getAllAddresses,
	getUserAddresses,
	updateAddress,
} from "../controllers/addressControllers";

const router = Router();

// All address routes need authorization
router.use(checkAuthorization);

router.post("/", createAddress);
router.patch("/:id", updateAddress);
router.get("/", getUserAddresses);
router.get("/all", checkAdmin, getAllAddresses);
router.delete("/:id", deleteAddress);

export default router;
