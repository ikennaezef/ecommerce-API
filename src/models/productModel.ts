import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Product name is required!"],
		maxLength: [100, "Product name cannot be more than 100 characters!"],
		unique: true,
	},
	slug: {
		type: String,
		unique: true,
		required: true,
	},
	price: {
		type: Number,
		required: [true, "Product price is required!"],
	},
	description: {
		type: String,
		required: [true, "Product description is required!"],
	},
	image: {
		type: String,
		required: [true, "Product image is required!"],
	},
	inventory: {
		type: Number,
		required: true,
		default: 1,
	},
	category: {
		type: String,
		required: [true, "Product category is required!"],
		enum: ["phones", "electronics", "computers", "accessories"],
	},
	company: {
		type: String,
		required: [true, "Product company is required!"],
	},
});

const Product = mongoose.model("Product", productSchema);
export default Product;
