import { Request } from "express";
import { ObjectId } from "mongoose";

interface IEmailSendParams {
	_id: ObjectId;
	email: string;
	firstName: string;
}

interface IUserDocument {
	userId: ObjectId;
	email: string;
	firstName: string;
	lastName: string;
	resetPassword?: boolean;
}

interface ExpressRequest extends Request {
	user?: IUserDocument;
	image?: string;
}

type ExtendedPayload =
	| (string & { email: string })
	| (JwtPayload & { email: string });

type QueryObject = {
	company?: string;
	category?: string;
	price?: string;
	sort?: string;
	fields?: string;
};
