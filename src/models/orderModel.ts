import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Product name is required!"],
	},
	quantity: {
		type: Number,
		required: true,
		min: 1,
		default: 1,
	},
	price: {
		type: Number,
		required: [true, "Product price is required!"],
	},
	image: {
		type: String,
		required: [true, "Product name is required!"],
	},
	productId: {
		type: mongoose.Types.ObjectId,
		ref: "Product",
		required: [true, "Product Id is required!"],
	},
});

const orderSchema = new mongoose.Schema({
	products: [cartItemSchema],
	buyerId: {
		type: mongoose.Types.ObjectId,
		ref: "User",
		required: [true, "Buyer Id is required!"],
	},
	shippingFee: {
		type: Number,
		required: [true, "Shipping fee is required!"],
	},
	tax: {
		type: Number,
		required: [true, "tax is required!"],
	},
	subTotal: {
		type: Number,
		required: [true, "Subtotal is required!"],
	},
	totalPrice: {
		type: Number,
		required: [true, "Total order price is required!"],
	},
	status: {
		type: String,
		required: [true, "Order status is required!"],
		enum: ["pending", "processing", "failed", "delivered"],
	},
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
