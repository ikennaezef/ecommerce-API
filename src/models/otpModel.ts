import mongoose from "mongoose";

const otpVerificationSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	otp: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		required: true,
	},
	expiresAt: {
		type: Date,
		required: true,
	},
});

const otpVerification = mongoose.model(
	"otpVerification",
	otpVerificationSchema
);

export default otpVerification;
