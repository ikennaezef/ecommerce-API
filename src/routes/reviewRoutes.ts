import { Router } from "express";
import { checkAdmin, checkAuthorization } from "../middleware/auth";
import {
	createReview,
	deleteReview,
	editReview,
	filterReviews,
	getProductReviews,
	getSingleReview,
} from "../controllers/reviewControllers";

const router = Router();

router.post("/", checkAuthorization, createReview);
router.get("/filter", filterReviews);
router.get("/product/:id", getProductReviews);
router.get("/:id", getSingleReview);
router.patch("/:id", checkAuthorization, editReview);
router.delete("/:id", checkAuthorization, deleteReview);

export default router;
