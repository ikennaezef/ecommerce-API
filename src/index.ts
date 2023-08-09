import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectDb } from "./db/connect";

dotenv.config();

const PORT = process.env.PORT! || 3001;

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
	res.send("<h1>Authentication API</h1>");
});

// app.use("/api/v1/auth", authRouter);

const start = async () => {
	try {
		await connectDb(process.env.MONGO_URI!);
		app.listen(PORT, () => console.log(`SERVER RUNNING ON PORT ${PORT}...`));
	} catch (error) {
		console.log("COULD NOT START SERVER", error);
	}
};

start();
