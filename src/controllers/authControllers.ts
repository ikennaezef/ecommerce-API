import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/userModel";
import OTPVerification from "../models/otpModel";
import {
	emailVerificationEmail,
	passwordResetEmail,
	sendNewUserMails,
} from "../utils/email";
import { createToken } from "../utils/jwt";
import { verifyOTP } from "../utils/otp";
import { ExpressRequest } from "../interfaces";
import { errorHandler } from "../middleware/error-handler";

const login = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return res
				.status(400)
				.json({ message: "Email and password are required!" });
		}

		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).json({ message: "User does not exist!" });
		}

		const passwordMatch = await bcrypt.compare(password, user.password!);
		if (!passwordMatch) {
			return res.status(400).json({ message: "Invalid credentials!" });
		}

		const data = {
			userId: user.id,
			email,
			firstName: user.firstName,
			lastName: user.lastName,
		};

		const token = createToken(data);

		res.status(200).json({
			token,
			message: "Login successful!",
			data,
			verified: user.verified,
		});
	} catch (error: any) {
		errorHandler(error, req, res);
	}
};

const register = async (req: Request, res: Response) => {
	const { firstName, lastName, email, password } = req.body;
	if (!firstName || !lastName || !email || !password) {
		return res.status(400).json({ message: "All fields are required!" });
	}

	if (password.length < 8) {
		return res.status(400).json({ message: "Password is too short!" });
	}

	try {
		const userExists = await User.findOne({ email });
		if (userExists) {
			return res
				.status(400)
				.json({ message: "That email is already registered!" });
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const newUser = await User.create({
			firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
			lastName: lastName.charAt(0).toUpperCase() + lastName.slice(1),
			email,
			password: hashedPassword,
		});

		if (!newUser) {
			return res
				.status(500)
				.json({ message: "An error occured. User not created!" });
		}

		await sendNewUserMails(
			{ _id: newUser.id, email, firstName: newUser.firstName! },
			res
		);
	} catch (error: any) {
		errorHandler(error, req, res);
	}
};

const verifyUser = async (req: Request, res: Response) => {
	const { email, otp } = req.body;
	if (!email || !otp) {
		return res.status(400).json({ message: "Email and OTP are required!" });
	}

	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).json({ message: "User not found!" });
		}

		if (user.verified) {
			return res.status(400).json({ message: "The user is already verified!" });
		}

		const validOTP = await verifyOTP(user.id, otp);
		if (validOTP) {
			await User.findOneAndUpdate({ email }, { verified: true });
			await OTPVerification.deleteMany({ userId: user.id });

			res
				.status(200)
				.json({ message: "User verification successful!", verified: true });
		}
	} catch (error: any) {
		errorHandler(error, req, res);
	}
};

const changePassword = async (req: ExpressRequest, res: Response) => {
	const { oldPassword, newPassword } = req.body;
	if (!oldPassword || !newPassword) {
		return res
			.status(400)
			.json({ message: "Old password and new password are required!" });
	}

	const tokenUserId = req.user?.userId;

	try {
		const user = await User.findById(tokenUserId);
		if (!user) {
			return res.status(404).json({ message: "User does not exist!" });
		}

		const oldPasswordsMatch = await bcrypt.compare(oldPassword, user.password!);
		if (!oldPasswordsMatch) {
			return res.status(400).json({ message: "Incorrect old password!" });
		}

		if (newPassword.length < 8) {
			return res.status(400).json({ message: "Password is too short!" });
		}

		const hashedPassword = await bcrypt.hash(newPassword, 10);
		await User.findByIdAndUpdate(
			tokenUserId,
			{ password: hashedPassword },
			{ new: true }
		);

		res.status(200).json({ message: "Password change successful!" });
	} catch (error: any) {
		errorHandler(error, req, res);
	}
};

const resendOTP = async (req: Request, res: Response) => {
	const { email } = req.body;
	if (!email) {
		return res.status(400).json({ message: "Email is required!" });
	}

	try {
		const userExists = await User.findOne({ email });
		if (!userExists) {
			return res.status(404).json({ message: "The user does not exist!" });
		}

		await emailVerificationEmail({
			_id: userExists.id,
			email,
			firstName: userExists.firstName!,
		});
		res.status(200).json({ message: "An OTP has been resent to your email" });
	} catch (error: any) {
		errorHandler(error, req, res);
	}
};

const forgotPassword = async (req: Request, res: Response) => {
	try {
		const { email } = req.body;
		if (!email) {
			return res.status(400).json({ message: "Please enter email!" });
		}

		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).json({ message: "Account does not exist!" });
		}

		const userId = user.id;
		await passwordResetEmail(
			{ _id: userId, email, firstName: user.firstName! },
			res
		);
	} catch (error: any) {
		errorHandler(error, req, res);
	}
};

const verifyPasswordReset = async (req: Request, res: Response) => {
	const { email, otp } = req.body;
	if (!email || !otp) {
		return res.status(400).json({ message: "Please enter email and OTP!" });
	}

	try {
		const userExists = await User.findOne({ email });
		if (!userExists) {
			return res.status(400).json({ message: "User does not exist!" });
		}

		const userId = userExists.id;

		const otpIsValid = await verifyOTP(userId, otp);
		if (otpIsValid) {
			await OTPVerification.deleteMany({ userId });
			const token = createToken(
				{ userId, email, resetPassword: true },
				process.env.JWT_PASSWORD_RESET_LIFETIME!
			);
			res.status(200).json({
				user: { id: userId, email },
				message: "User has been verified. Proceed to reset your password.",
				token,
			});
		}
	} catch (error: any) {
		errorHandler(error, req, res);
	}
};

const resetPassword = async (req: ExpressRequest, res: Response) => {
	const { password, confirmPassword } = req.body;
	if (!password || !confirmPassword) {
		return res.status(400).json({ message: "All fields are required!" });
	}

	if (password != confirmPassword) {
		return res.status(400).json({ message: "Passwords do not match!" });
	}

	if (password.length < 8) {
		return res.status(400).json({ message: "Password is too short!" });
	}

	const userFromReq = req.user;
	const isPasswordResetToken = userFromReq?.resetPassword;

	if (!isPasswordResetToken) {
		return res.status(403).json({
			message: "Invalid auth token! Please request for a password reset again.",
		});
	}

	try {
		const userEmail = userFromReq.email;
		const hashedPassword = await bcrypt.hash(password, 10);

		await User.findOneAndUpdate(
			{ email: userEmail },
			{ password: hashedPassword },
			{ new: true }
		);

		res.status(200).json({
			message: "Password reset successful! Proceed to login.",
		});
	} catch (error: any) {
		errorHandler(error, req, res);
	}
};

export {
	login,
	register,
	resendOTP,
	changePassword,
	forgotPassword,
	verifyUser,
	resetPassword,
	verifyPasswordReset,
};
