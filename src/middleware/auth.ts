import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import { ExpressRequest, ExtendedPayload } from "../interfaces";
import User from "../models/userModel";

const checkAuthorization = (
	req: ExpressRequest,
	res: Response,
	next: NextFunction
) => {
	const authHeader = req.headers.authorization;

	if (!authHeader) {
		return res.status(401).json({ message: "Authorization missing!" });
	}

	if (!authHeader.startsWith("Bearer")) {
		return res.status(401).json({ message: "Invalid authorization format!" });
	}

	const authToken = authHeader.split(" ")[1];

	try {
		const decodedData = verifyToken(authToken) as ExtendedPayload;
		req.user = decodedData;
		next();
	} catch (error: any) {
		res.status(401).json({ message: error.message });
	}
};

const checkAdmin = async (
	req: ExpressRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		const userId = req.user?.userId;
		if (!userId) {
			return res
				.status(400)
				.json({
					message:
						"User id not provided! This could be because there is no token in your request header.",
				});
		}

		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({ message: "User not found!" });
		}

		const userIsAdmin = user.isAdmin;
		if (!userIsAdmin) {
			return res
				.status(403)
				.json({ message: "You are not allowed to perform this operation!" });
		}

		next();
	} catch (error: any) {
		res.status(403).json({ message: error.message });
	}
};

export { checkAuthorization, checkAdmin };
