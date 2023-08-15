import { Router } from "express";
import {
	changePassword,
	forgotPassword,
	login,
	register,
	resendOTP,
	resetPassword,
	verifyPasswordReset,
	verifyUser,
} from "../controllers/authControllers";
import { checkAuthorization } from "../middleware/auth";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/forgot-password", forgotPassword);
router.post("/resend-otp", resendOTP);
router.post("/verify-user", verifyUser);
router.post("/verify-password-reset", verifyPasswordReset);
router.post("/reset-password", checkAuthorization, resetPassword);
router.post("/change-password", checkAuthorization, changePassword);

export default router;
