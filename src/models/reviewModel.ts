import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Types.ObjectId,
			ref: "User",
			required: true,
		},
		firstName: {
			type: String,
			required: [true, "First name is required!"],
		},
		productId: {
			type: mongoose.Types.ObjectId,
			ref: "Product",
			required: true,
		},
		rating: {
			type: Number,
			min: 1,
			max: 5,
			required: true,
		},
		comment: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);
export default Review;
