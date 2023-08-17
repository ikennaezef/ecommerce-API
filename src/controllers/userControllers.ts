import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/userModel";
import { ExpressRequest } from "../interfaces";
import { errorHandler } from "../middleware/error-handler";

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

const getAllUsers = async (req: ExpressRequest, res: Response) => {
	try {
		const users = await User.find({}, { password: 0 });
		res
			.status(200)
			.json({ message: "Success", data: { users, count: users.length } });
	} catch (error: any) {
		errorHandler(error, req, res);
	}
};

const getUser = async (req: ExpressRequest, res: Response) => {
	const { id: userId } = req.params;

	try {
		const user = await User.findById(userId, { password: 0 });
		if (!user) {
			return res.status(404).json({ message: "User not found!" });
		}

		res.status(200).json({ message: "Success!", data: user });
	} catch (error: any) {
		errorHandler(error, req, res);
	}
};

const searchUser = async (req: ExpressRequest, res: Response) => {
	const { query } = req.query;

	if (!query) {
		return res.status(400).json({ message: "Search query is missing!" });
	}

	try {
		const results = await User.find({
			$or: [
				{ firstName: { $regex: query, $options: "i" } },
				{ lastName: { $regex: query, $options: "i" } },
				{ email: { $regex: query, $options: "i" } },
			],
		});

		res
			.status(200)
			.json({ message: "Success!", data: { results, count: results.length } });
	} catch (error: any) {
		errorHandler(error, req, res);
	}
};

export { changePassword, getAllUsers, getUser, searchUser };
