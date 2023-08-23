import { Request, Response } from "express";
import Order from "../models/orderModel";
import { errorHandler } from "../middleware/error-handler";
import { ExpressRequest } from "../interfaces";
import User from "../models/userModel";
import Address from "../models/addressModel";
import Product from "../models/productModel";

const prods = [
	{
		productId: "64df223766db5cea9093f0a6",
		name: "Samsung Galaxy A54 8GB + 128GB 5G",
		price: 375000,
		image:
			"https://firebasestorage.googleapis.com/v0/b/socialstream-ba300.appspot.com/o/ecommerce_files%2Fproducts%2Fgalaxy_a54.jpg?alt=media&token=983963b4-2f4e-4695-8573-703c7b662889",
		quantity: 2,
	},
	{
		productId: "64df223766db5cea9093f0a7",
		name: "Samsung Galaxy A34 6GB + 128GB 5G",
		price: 295000,
		image:
			"https://firebasestorage.googleapis.com/v0/b/socialstream-ba300.appspot.com/o/ecommerce_files%2Fproducts%2Fgalaxy_a34.jpg?alt=media&token=233d412a-c9a8-40ff-8448-02d97f0132ac",
		quantity: 2,
	},
	{
		productId: "64df223766db5cea9093f0a8",
		name: "Samsung Galaxy A24 6GB + 128GB",
		price: 195500,
		image:
			"https://firebasestorage.googleapis.com/v0/b/socialstream-ba300.appspot.com/o/ecommerce_files%2Fproducts%2Fgalaxy_a24.jpg?alt=media&token=6423a578-21b4-4123-9064-de0291a28c5c",
		quantity: 1,
	},
];

const createOrder = async (req: ExpressRequest, res: Response) => {
	try {
		const { products, addressId, shippingFee, tax } = req.body;
		const userId = req.user?.userId;

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found!" });
		}

		if (!user.verified) {
			return res
				.status(405)
				.json({ message: "Please verify your email to place an order!" });
		}

		if (!products || !addressId || !shippingFee || !tax) {
			return res.status(400).json({ message: "All fields are required!" });
		}

		if (!Array.isArray(products) || products.length < 1) {
			return res.status(400).json({ message: "Products are required!" });
		}

		// Check if the address belongs to the user
		const address = await Address.findById(addressId);
		if (!address) {
			return res.status(404).json({ message: "Address not found!" });
		}

		if (address.userId != userId) {
			return res.status(403).json({
				message: "The address belongs to another user!",
			});
		}

		let orderCart: any[] = [];
		let subTotal = 0;

		for (const product of products) {
			if (!product._id) {
				return res.status(400).json({ message: "Product id is required!" });
			}
			const productExists = await Product.findById(product._id);
			if (!productExists) {
				return res
					.status(404)
					.json({ message: `Product with id ${product._id} not found!` });
			}

			// Check if there are enough products in inventory
			const prodQuantity = Number(product.quantity);
			if (prodQuantity > productExists.inventory) {
				return res.status(500).json({
					message: `Insufficient number of ${productExists.name} in the inventory!`,
				});
			}

			await Product.findByIdAndUpdate(
				product._id,
				{ inventory: productExists.inventory - prodQuantity },
				{ new: true, runValidators: true }
			);

			const productSum = productExists.price! * prodQuantity;
			subTotal += productSum;

			const { _id: productId, name, price, image } = productExists;
			const orderItem = {
				productId,
				name,
				image,
				price,
				quantity: prodQuantity,
			};
			orderCart = [...orderCart, orderItem];
		}

		const totalPrice = subTotal + Number(tax) + Number(shippingFee);

		const newOrder = await Order.create({
			products: orderCart,
			buyerId: userId,
			buyerEmail: req.user?.email,
			addressId,
			shippingFee,
			tax,
			subTotal,
			totalPrice,
		});
		res
			.status(201)
			.json({ message: "Order created successfully!", data: newOrder });
	} catch (error: any) {
		errorHandler(error, req, res);
	}
};

const getAllOrders = async (req: Request, res: Response) => {
	try {
		const orders = await Order.find({});
		res
			.status(200)
			.json({ message: "Success!", data: { orders, count: orders.length } });
	} catch (error: any) {
		errorHandler(error, req, res);
	}
};

const getUserOrders = async (req: ExpressRequest, res: Response) => {
	const userId = req.user?.userId;

	try {
		const user = await User.findById(userId, {
			firstName: 1,
			lastName: 1,
			email: 1,
		});
		if (!user) {
			return res.status(404).json({ message: "User not found!" });
		}

		const orders = await Order.find({ buyerId: userId });
		res.status(200).json({
			message: "Success!",
			data: { user, orders, count: orders.length },
		});
	} catch (error: any) {
		errorHandler(error, req, res);
	}
};

const updateOrderStatus = async (req: Request, res: Response) => {
	const {
		params: { id },
		body: { status },
	} = req;

	if (!status) {
		return res.status(400).json({ message: "Order status is required!" });
	}

	try {
		const order = await Order.findByIdAndUpdate(
			id,
			{ status },
			{ new: true, runValidators: true }
		);

		if (!order) {
			return res.status(404).json({ message: "Order not found!" });
		}

		res.status(200).json({ message: "Order status updated!", data: order });
	} catch (error: any) {
		errorHandler(error, req, res);
	}
};

export { createOrder, getAllOrders, getUserOrders, updateOrderStatus };
