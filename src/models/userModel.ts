import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			required: [true, "First name is required!"],
		},
		lastName: {
			type: String,
			required: [true, "Last name is required!"],
		},
		email: {
			type: String,
			unique: true,
			required: [true, "Email is required!"],
		},
		password: {
			type: String,
			required: [true, "Password is required!"],
		},
		isAdmin: {
			type: Boolean,
			default: false,
		},
		verified: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
