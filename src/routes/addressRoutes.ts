import { Router } from "express";
import { checkAdmin, checkAuthorization } from "../middleware/auth";
import {
	createAddress,
	deleteAddress,
	getAllAddresses,
	getSingleAddress,
	getUserAddresses,
	updateAddress,
} from "../controllers/addressControllers";

const router = Router();

// All address routes need authorization
router.use(checkAuthorization);

router.route("/").get(checkAdmin, getAllAddresses).post(createAddress);
router.route("/user").get(getUserAddresses);
router
	.route("/:id")
	.get(getSingleAddress)
	.patch(updateAddress)
	.delete(deleteAddress);

export default router;
