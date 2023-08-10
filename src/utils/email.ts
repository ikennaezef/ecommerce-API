import pug from "pug";
import nodemailer from "nodemailer";
import path from "path";
import { Response } from "express";
import { IEmailSendParams } from "../interfaces";
import { createOTP } from "./otp";
require("dotenv").config();

const transporter = nodemailer.createTransport({
	host: process.env.MAIL_SMTP, // use SSL
	port: 465,
	secure: true,
	auth: {
		user: process.env.MAIL_USER,
		pass: process.env.MAIL_PASSWORD,
	},
	tls: {
		rejectUnauthorized: false,
	},
});

const welcomeEmail = async (email: string, firstName: string) => {
	const filePath = path.join(__dirname, "../views/welcome.pug");
	const compiledTemplate = pug.compileFile(filePath);
	const html = compiledTemplate({ name: firstName });

	const mailOptions = {
		from: process.env.MAIL_USER as string,
		to: email,
		subject: "Welcome To E-Commerce",
		html,
	};

	transporter.sendMail(mailOptions, (err, info) => {
		if (err) {
			console.log("An error occured:", err.message);
			throw Error("An error occured! Welcome email not sent");
		}
	});
};

const emailVerificationEmail = async ({
	_id,
	email,
	firstName,
}: IEmailSendParams) => {
	const otp = await createOTP(_id, 86400000); // 24 hrs validity

	const filePath = path.join(__dirname, "../views/verify-email.pug");
	const compiledTemplate = pug.compileFile(filePath);
	const html = compiledTemplate({ name: firstName, otp });

	const mailOptions = {
		from: "E-Commerce Team",
		to: email,
		subject: "Verify Your Email",
		html,
	};

	transporter.sendMail(mailOptions, (err, info) => {
		if (err) {
			console.log("An error occured:", err.message);
			throw Error("An error occured! Verification email not sent");
		}
	});
};

const passwordResetEmail = async (
	{ _id, email, firstName }: IEmailSendParams,
	res: Response
) => {
	res.send("Password reset Email sent!");
};

const sendNewUserMails = async (
	{ _id, email, firstName }: IEmailSendParams,
	res: Response
) => {
	try {
		await welcomeEmail(email, firstName);
		await emailVerificationEmail({ _id, email, firstName });

		res.status(201).json({
			status: "PENDING",
			message: "An OTP has been sent to your email.",
		});
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
};

export { sendNewUserMails, emailVerificationEmail, passwordResetEmail };
