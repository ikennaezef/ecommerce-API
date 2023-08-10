import { Router } from "express";
import {
	forgotPassword,
	login,
	register,
	resendOTP,
	verifyUser,
} from "../controllers/authControllers";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/forgot-password", forgotPassword);
router.post("/resend-otp", resendOTP);
router.post("/verify-user", verifyUser);

export default router;
