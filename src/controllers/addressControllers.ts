import { Request, Response } from "express";
import Address from "../models/addressModel";
import User from "../models/userModel";
import { ExpressRequest } from "../interfaces";
import { errorHandler } from "../middleware/error-handler";

const createAddress = async (req: ExpressRequest, res: Response) => {
	const { address, city, additionalInfo, phone, additionalPhone } = req.body;
	if (!address || !city || !phone) {
		return res
			.status(400)
			.json({ message: "Address, city and phone are required!" });
	}

	try {
		const userId = req.user?.userId;

		const newAddress = await Address.create({
			userId,
			address,
			city,
			additionalInfo,
			phone,
			additionalPhone,
		});
		if (!newAddress) {
			return res
				.status(500)
				.json({ message: "A error occured! Address not added!" });
		}

		res.status(201).json({ message: "Address created!", data: newAddress });
	} catch (error: any) {
		errorHandler(error, req, res);
	}
};

const getUserAddresses = async (req: ExpressRequest, res: Response) => {
	try {
		const userId = req.user?.userId;
		const userAddresses = await Address.find({ userId });

		res.status(200).json({ message: "Success!", data: userAddresses });
	} catch (error: any) {
		errorHandler(error, req, res);
	}
};

const getAllAddresses = async (req: Request, res: Response) => {
	try {
		const addresses = await Address.find({});
		res.status(200).json({ message: "Success!", data: addresses });
	} catch (error: any) {
		errorHandler(error, req, res);
	}
};

const updateAddress = async (req: ExpressRequest, res: Response) => {
	const {
		body: { address, city, additionalInfo, phone, additionalPhone },
		params: { id: addressId },
	} = req;
	const userId = req.user?.userId;

	try {
		const userAddress = await Address.findOneAndUpdate(
			{ _id: addressId, userId },
			{ address, city, additionalInfo, phone, additionalPhone },
			{ new: true, runValidators: true }
		);

		if (!userAddress) {
			return res.status(404).json({ message: "Address not found!" });
		}

		res.status(200).json({ data: userAddress, message: "Success!" });
	} catch (error: any) {
		errorHandler(error, req, res);
	}
};

const deleteAddress = async (req: ExpressRequest, res: Response) => {
	try {
		const { id } = req.params;
		const userId = req.user?.userId;

		const address = await Address.findOne({ _id: id, userId });
		if (!address) {
			return res.status(404).json({ message: "Address not found!" });
		}

		await Address.findByIdAndDelete(id);
		res.status(200).json({ message: "Address deleted successfully!" });
	} catch (error: any) {
		errorHandler(error, req, res);
	}
};

export {
	createAddress,
	getAllAddresses,
	getUserAddresses,
	updateAddress,
	deleteAddress,
};
