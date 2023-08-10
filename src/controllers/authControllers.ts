import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/userModel";
import { emailVerificationEmail, sendNewUserMails } from "../utils/email";

const login = async (req: Request, res: Response) => {
	res.send("Login");
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
		res.status(500).json({ message: error.message });
	}
};

const verifyUser = async (req: Request, res: Response) => {
	res.send("Verify User");
};
const changePassword = async (req: Request, res: Response) => {
	res.send("Change Password");
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
		return res.status(500).json({ message: error.message });
	}
};

const forgotPassword = async (req: Request, res: Response) => {
	res.send("Forgot Password");
};

export {
	login,
	register,
	resendOTP,
	changePassword,
	forgotPassword,
	verifyUser,
};
