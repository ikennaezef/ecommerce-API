import { NextFunction, Response } from "express";
import multer from "multer";
import config from "../config/firebase";
import { initializeApp } from "firebase/app";
import {
	getStorage,
	deleteObject,
	ref,
	getDownloadURL,
	uploadBytesResumable,
} from "firebase/storage";
import { ExpressRequest } from "../interfaces";

initializeApp(config.firebaseConfig);

const storage = getStorage();

const upload = multer({ storage: multer.memoryStorage() });

const uploadImage = async (req: ExpressRequest) => {
	try {
		if (!req.file) {
			throw Error("No file uploaded!");
		}

		const dateTime = new Date().toISOString();

		const storageRef = ref(
			storage,
			`ecommerce_files/products/${req?.file?.originalname} ${dateTime}`
		);

		// Create file metadata including the content type
		const metadata = {
			contentType: req?.file?.mimetype,
		};

		// Upload file to bucket storage
		const snapshot = await uploadBytesResumable(
			storageRef,
			req?.file?.buffer!,
			metadata
		);

		// Grab the public url
		const downloadURL = await getDownloadURL(snapshot.ref);

		if (!downloadURL) {
			throw Error("An error occured");
		}

		req.image = downloadURL;

		return;
	} catch (error: any) {
		throw Error(error.message);
	}
};

const deleteImage = async (imageURL: string) => {
	try {
		const imageRef = ref(storage, imageURL);
		await deleteObject(imageRef);
		return;
	} catch (error) {
		throw Error("An error occured while deleting!");
	}
};

export { uploadImage, upload, deleteImage };
