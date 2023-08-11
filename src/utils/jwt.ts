import jwt from "jsonwebtoken";
require("dotenv").config();

const createToken = (data: any, expiry: string = process.env.JWT_LIFETIME!) => {
	const token = jwt.sign(data, process.env.JWT_SECRET!, { expiresIn: expiry });
	return token;
};

const verifyToken = (token: string) => {
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET!);
		return decoded;
	} catch (error: any) {
		switch (error.name) {
			case "JsonWebTokenError":
				throw Error("There is a problem with the token!");
			case "TokenExpiredError":
				throw Error("The token is expired!");
			default:
				throw Error("Invalid token!");
		}
	}
};

export { createToken, verifyToken };
