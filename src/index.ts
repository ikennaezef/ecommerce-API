import express, { Request, Response } from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";

import { connectDb } from "./db/connect";
import {
	addressRouter,
	authRouter,
	orderRouter,
	productRouter,
	reviewRouter,
	userRouter,
} from "./routes";
import { notFound } from "./middleware/not-found";

dotenv.config();

const PORT = process.env.PORT! || 3001;

const app = express();
app.use(express.json());
app.use(express.static(__dirname));
app.use(cors());
app.use(helmet());

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.get("/", (req: Request, res: Response) => {
	res.send("<h1>E-Commerce API</h1>");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/addresses", addressRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", orderRouter);

app.use(notFound);

const start = async () => {
	try {
		await connectDb(process.env.MONGO_URI!);

		app.listen(PORT, () => console.log(`SERVER RUNNING ON PORT ${PORT}...`));
	} catch (error) {
		console.log("COULD NOT START SERVER", error);
	}
};

start();
