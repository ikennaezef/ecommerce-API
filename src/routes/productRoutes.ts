import { Router } from "express";
import { checkAdmin, checkAuthorization } from "../middleware/auth";
import { upload } from "../utils/imageUpload";
import {
	createProduct,
	deleteProduct,
	filterProducts,
	getAllProducts,
	getProductByCategory,
	getProductByCompany,
	getSingleProduct,
	searchProduct,
	updateProduct,
} from "../controllers/productControllers";

const router = Router();

router.post(
	"/",
	checkAuthorization,
	checkAdmin,
	upload.single("picture"),
	createProduct
);
router.get("/all", checkAuthorization, checkAdmin, getAllProducts);
router.get("/category", getProductByCategory);
router.get("/company", getProductByCompany);
router.get("/search", searchProduct);
router.get("/filter", filterProducts);
router
	.route("/:id")
	.get(getSingleProduct)
	.patch(
		checkAuthorization,
		checkAdmin,
		upload.single("picture"),
		updateProduct
	)
	.delete(checkAuthorization, checkAdmin, deleteProduct);

export default router;
