import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import { ExpressRequest, ExtendedPayload } from "../interfaces";

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

const checkAdmin = (req: ExpressRequest, res: Response, next: NextFunction) => {
	try {
		// const {userId} = req.user
	} catch (error: any) {
		res.status(403).json({ message: "" });
	}
};

export { checkAuthorization };
