import { Router } from "express";
import { checkAdmin, checkAuthorization } from "../middleware/auth";
import {
	createOrder,
	getAllOrders,
	getUserOrders,
	updateOrderStatus,
} from "../controllers/orderControllers";

const router = Router();

router.get("/", checkAuthorization, checkAdmin, getAllOrders);
router.get("/user", checkAuthorization, getUserOrders);
router.post("/", checkAuthorization, createOrder);
router.patch("/:id", checkAuthorization, checkAdmin, updateOrderStatus);

export default router;
