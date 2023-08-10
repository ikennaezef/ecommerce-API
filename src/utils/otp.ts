import bcrypt from "bcrypt";
import OtpVerification from "../models/otpModel";
import { ObjectId } from "mongoose";

const createOTP = async (userId: ObjectId, lifetime: number) => {
	const otp = `${Math.floor(1000 + Math.random() * 8999)}`;
	const hashedOTP = await bcrypt.hash(otp, 10);

	// Delete any previously existing OTPs for the user
	await OtpVerification.deleteMany({ userId });

	const newOTP = await OtpVerification.create({
		userId,
		otp: hashedOTP,
		createdAt: Date.now(),
		expiresAt: Date.now() + lifetime,
	});

	if (!newOTP) {
		throw Error("OTP could not be created!");
	} else {
		return otp;
	}
};

const verifyOTP = async (userId: string, otp: string) => {
	if (!userId || !otp) {
		throw Error("Please enter userId and OTP!");
	}

	const otpExists = await OtpVerification.findOne({ userId });
	if (!otpExists) {
		throw Error("Record does not exist! Please register or login.");
	}

	if (new Date(Date.now()) > otpExists.expiresAt) {
		await OtpVerification.deleteMany({ userId });
		throw Error("The OTP has expired! Please request for another one.");
	}

	const validOTP = await bcrypt.compare(otp, otpExists.otp);
	if (!validOTP) {
		throw Error("Invalid OTP!");
	} else {
		return validOTP;
	}
};

export { createOTP, verifyOTP };
