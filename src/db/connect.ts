import mongoose from "mongoose";

export const connectDb = async (connectionString: string) => {
	return mongoose.connect(connectionString, {
		retryReads: true,
	});
};
