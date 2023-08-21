import { Request, Response } from "express";
import Review from "../models/reviewModel";
import User from "../models/userModel";
import { ExpressRequest } from "../interfaces";
import { errorHandler } from "../middleware/error-handler";
import Product from "../models/productModel";

const createReview = async (req: ExpressRequest, res: Response) => {
	const { productId, comment, rating } = req.body;

	if (!productId || !comment || !rating) {
		return res
			.status(400)
			.json({ message: "Product id, comment and rating are required!" });
	}

	try {
		const product = await Product.findById(productId);
		if (!product) {
			return res.status(404).json({ message: "Product not found!" });
		}

		const userId = req.user?.userId;
		const firstName = req.user?.firstName;
		const userReviewExistsForProduct = await Review.findOne({
			userId,
			productId,
		});
		if (userReviewExistsForProduct) {
			return res.status(405).json({
				message: "User is not allowed to review a product more than once!",
			});
		}

		const newReview = await Review.create({
			userId,
			firstName,
			productId,
			rating: Number(rating),
			comment,
		});

		if (!newReview) {
			return res
				.status(500)
				.json({ message: "An error occured! Review not created!" });
		}

		res
			.status(201)
			.json({ message: "Review added successfully!", data: newReview });
	} catch (error) {
		errorHandler(error, req, res);
	}
};

const editReview = async (req: ExpressRequest, res: Response) => {
	const {
		body: { comment, rating },
		params: { id },
	} = req;

	if (!comment && !rating) {
		return res
			.status(400)
			.json({ message: "Either comment or rating is required!" });
	}

	try {
		const reviewExists = await Review.findById(id);
		if (!reviewExists) {
			return res.status(404).json({ message: "Review does not exist!" });
		}

		const userId = req.user?.userId;
		if (reviewExists.userId != userId) {
			return res
				.status(403)
				.json({ message: "You cannot edit another user's review!" });
		}

		const updatedReview = await Review.findByIdAndUpdate(
			id,
			{ comment, rating },
			{ new: true, runValidators: true }
		);
		res.status(200).json({ message: "Review updated!", data: updatedReview });
	} catch (error: any) {
		errorHandler(error, req, res);
	}
};

const getProductReviews = async (req: ExpressRequest, res: Response) => {
	const { id: productId } = req.params;

	try {
		const product = await Product.findById(productId);
		if (!product) {
			return res.status(404).json({ message: "Product not found!" });
		}

		const productReviews = await Review.find({ productId });

		res.status(200).json({
			message: "Success!",
			data: { reviews: productReviews, count: productReviews.length },
		});
	} catch (error: any) {
		errorHandler(error, req, res);
	}
};

const getSingleReview = async (req: ExpressRequest, res: Response) => {
	const { id } = req.params;

	try {
		const review = await Review.findById(id);
		if (!review) {
			return res.status(404).json({ message: "Review not found!" });
		}

		res.status(200).json({ message: "Success!", data: review });
	} catch (error: any) {
		errorHandler(error, req, res);
	}
};

const filterReviews = async (req: ExpressRequest, res: Response) => {
	const { filters } = req.query;
	const queryObject: any = {};

	if (filters) {
		const operatorMap: any = {
			">": "$gt",
			">=": "$gte",
			"=": "$eq",
			"<": "$lt",
			"<=": "$lte",
		};

		const regEx = /\b(<|>|>=|<=|=)\b/g;

		let opFilters: any = (filters as string).replace(
			regEx,
			(match) => `-${operatorMap[match]}-`
		);

		queryObject.rating = {};
		opFilters = opFilters.split(",").forEach((item: any) => {
			const [field, operator, value] = item.split("-");
			if (field === "rating") {
				queryObject.rating[operator] = Number(value);
			}
		});
	}

	try {
		let results = Review.find(queryObject);

		const reviews = await results;
		res
			.status(200)
			.json({ message: "Success", data: { reviews, count: reviews.length } });
	} catch (error) {
		errorHandler(error, req, res);
	}
};

const deleteReview = async (req: ExpressRequest, res: Response) => {
	const { id } = req.params;

	try {
		const reviewExists = await Review.findById(id);
		if (!reviewExists) {
			return res.status(404).json({ message: "Review does not exist!" });
		}

		const userId = req.user?.userId;
		if (reviewExists.userId != userId) {
			return res
				.status(403)
				.json({ message: "You cannot delete another user's review!" });
		}

		await Review.findByIdAndDelete(id);
		res.status(200).json({ message: "Review deleted!" });
	} catch (error: any) {
		errorHandler(error, req, res);
	}
};

export {
	createReview,
	editReview,
	deleteReview,
	getProductReviews,
	getSingleReview,
	filterReviews,
};
