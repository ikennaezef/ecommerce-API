import { Request, Response } from "express";
import slugify from "slugify";
import Product from "../models/productModel";
import { ExpressRequest } from "../interfaces";
import { errorHandler } from "../middleware/error-handler";
import { deleteImage, uploadImage } from "../utils/imageUpload";
import Review from "../models/reviewModel";

const createProduct = async (req: ExpressRequest, res: Response) => {
	const { name, price, description, inventory, category, company } = req.body;
	if (!name || !price || !description || !category || !company) {
		return res.status(400).json({
			message: "Name, price, description, category and company are required!",
		});
	}

	try {
		const nameSlug = slugify(name, { lower: true });
		await uploadImage(req);
		const productImage = req.image;

		const newProduct = await Product.create({
			name,
			slug: nameSlug,
			description,
			price: Number(price),
			image: productImage,
			category,
			company: company.toLowerCase(),
			inventory: Number(inventory),
		});

		if (!newProduct) {
			return res
				.status(400)
				.json({ message: "An error occured! Product not created." });
		}

		res
			.status(201)
			.json({ message: "Product created successfully!", data: newProduct });
	} catch (err: any) {
		errorHandler(err, req, res);
	}
};

const getAllProducts = async (req: Request, res: Response) => {
	try {
		const products = await Product.find({});
		res
			.status(200)
			.json({ message: "Success", data: { products, count: products.length } });
	} catch (error: any) {
		errorHandler(error, req, res);
	}
};

const getSingleProduct = async (req: Request, res: Response) => {
	const { id } = req.params;

	try {
		const product = await Product.findById(id);
		if (!product) {
			return res.status(404).json({ message: "Product not found!" });
		}

		const productReviews = await Review.find({ productId: id });

		res.status(200).json({
			message: "Success!",
			data: {
				product,
				reviews: productReviews,
				reviewsCount: productReviews.length,
			},
		});
	} catch (error: any) {
		errorHandler(error, req, res);
	}
};

const getProductByCategory = async (req: Request, res: Response) => {
	const { category } = req.query;

	if (!category) {
		return res.status(400).json({ message: "No category provided!" });
	}

	try {
		const products = await Product.find({ category });
		res.status(200).json({
			message: "Success!",
			data: { products, count: products.length },
		});
	} catch (error: any) {
		errorHandler(error, req, res);
	}
};

const getProductByCompany = async (req: Request, res: Response) => {
	const { company } = req.query;

	if (!company) {
		return res.status(400).json({ message: "No company provided!" });
	}

	try {
		const products = await Product.find({ company });
		res.status(200).json({
			message: "Success!",
			data: { products, count: products.length },
		});
	} catch (error: any) {
		errorHandler(error, req, res);
	}
};

const searchProduct = async (req: Request, res: Response) => {
	const { query } = req.query;

	if (!query) {
		return res.status(400).json({ message: "Search query is missing!" });
	}

	try {
		const results = await Product.find({
			$or: [
				{ name: { $regex: query, $options: "i" } },
				{ slug: { $regex: query, $options: "i" } },
				{ description: { $regex: query, $options: "i" } },
			],
		});

		res
			.status(200)
			.json({ message: "Success!", data: { results, count: results.length } });
	} catch (error: any) {
		errorHandler(error, req, res);
	}
};

const filterProducts = async (req: Request, res: Response) => {
	const { category, company, fields, priceFilter } = req.query;
	const queryObject: any = {};

	if (category) {
		queryObject.category = category as string;
	}

	if (company) {
		queryObject.company = company as string;
	}

	if (priceFilter) {
		const operatorMap: any = {
			">": "$gt",
			">=": "$gte",
			"=": "$eq",
			"<": "$lt",
			"<=": "$lte",
		};

		const regEx = /\b(<|>|>=|<=|=)\b/g;

		let filters: any = (priceFilter as string).replace(
			regEx,
			(match) => `-${operatorMap[match]}-`
		);

		queryObject.price = {};
		filters = filters.split(",").forEach((item: any) => {
			const [field, operator, value] = item.split("-");
			if (field === "price") {
				queryObject.price[operator] = Number(value);
			}
		});
	}

	try {
		let results = Product.find(queryObject);

		if (fields) {
			const fieldList = (fields as string).split(",").join(" ");
			results = results.select(fieldList);
		}

		const products = await results;
		res
			.status(200)
			.json({ message: "Success", data: { products, count: products.length } });
	} catch (error) {
		errorHandler(error, req, res);
	}
};

const updateProduct = async (req: ExpressRequest, res: Response) => {
	const {
		body: { name, price, description, inventory, category, company },
		params: { id: productId },
	} = req;

	try {
		const product = await Product.findById(productId);
		if (!product) {
			return res.status(404).json({ message: "Product not found!" });
		}

		let newSlug = null;
		if (name) {
			newSlug = slugify(name, { lower: true });
		}

		const updateData: any = {
			name,
			description,
			category,
			company: company?.toLowerCase(),
		};

		if (name) {
			updateData.slug = newSlug;
		}

		if (price) {
			updateData.price = Number(price);
		}
		if (inventory) {
			updateData.inventory = Number(inventory);
		}

		// If updating the image
		if (req.file) {
			await uploadImage(req);
			await deleteImage(product.image!); // Delete the initial product image after uploading a new one
			updateData.image = req.image;
		}

		const productUpdate = await Product.findByIdAndUpdate(
			productId,
			updateData,
			{ new: true, runValidators: true }
		);

		if (!productUpdate) {
			return res
				.status(500)
				.json({ message: "An error occured! Could not update product." });
		}

		res
			.status(200)
			.json({ message: "Product updated successfully!", data: productUpdate });
	} catch (error: any) {
		errorHandler(error, req, res);
	}
};

const deleteProduct = async (req: Request, res: Response) => {
	const { id: productId } = req.params;

	try {
		const product = await Product.findById(productId);
		if (!product) {
			return res.status(404).json({ message: "Product not found!" });
		}

		// Delete image from DB first
		await deleteImage(product.image!);
		await product.deleteOne({ _id: productId });

		// Delete all reviews for the product
		await Review.deleteMany({ productId });
		res.status(200).json({ message: "Product deleted successfully!" });
	} catch (error: any) {
		errorHandler(error, req, res);
	}
};

export {
	createProduct,
	deleteProduct,
	updateProduct,
	getAllProducts,
	getSingleProduct,
	getProductByCategory,
	getProductByCompany,
	searchProduct,
	filterProducts,
};
