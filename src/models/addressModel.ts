import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Types.ObjectId,
			ref: "User",
			required: true,
		},
		address: {
			type: String,
			required: [true, "Address is required!"],
		},
		city: {
			type: String,
			required: [true, "City is required!"],
		},
		additionalInfo: {
			type: String,
		},
		phone: {
			type: String,
			required: [true, "Phone number is required!"],
		},
		additionalPhone: {
			type: String,
		},
	},
	{ timestamps: true }
);

const Address = mongoose.model("Address", addressSchema);
export default Address;
