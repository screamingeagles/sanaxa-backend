const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const HttpError = require("./models/http-error").HttpError;

const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(bodyParser.json());

const Restaurant = require("./models/restaurant");
const FoodCategory = require("./models/foodcategory");
const FoodItem = require("./models/fooditem");

// app.use("/", async (req, res, next) => {
// 	const newRestaurant = new Restaurant({
// 		name: "Newton Hotel",
// 		address: "Everywhere",
// 		tags: ["Best Quality"],
// 		rating: 2,
// 		deliveryTime: 60,
// 	});
// 	await newRestaurant.save();
// });

// app.use("/", async (req, res, next) => {
// 	const foodCategory = new FoodCategory({
// 		restaurant: "5ee3da54d8c4b3203065c34e",
// 		categoryName: "Chinese",
// 	});
// 	const cat = await foodCategory.save();
// 	console.log(cat);
// });

// app.use("/", async (req, res, next) => {
// 	const foodCategoryUid = "5ee3dcf8e1d0ed08fcdf05ab";
// 	const foodItems = new FoodItem({
// 		foodCategory: foodCategoryUid,
// 		foodList: { name: "Chinese 2", price: 120 },
// 	});
// 	try {
// 		const foodItemsListUpdated = await foodItems.save();
// 		const foodCategory = await FoodCategory.findById(foodCategoryUid);
// 		foodCategoryTempList = [
// 			...foodCategory.foodItems,
// 			foodItemsListUpdated._id,
// 		];
// 		foodCategory.foodItems = foodCategoryTempList;

// 		await foodCategory.save();
// 	} catch (err) {
// 		const error = new HttpError("Error, please", 404);
// 		throw error;
// 	}
// });

// app.use("/", async (req, res, next) => {
// 	const foodItemsListDetailsPage = await FoodCategory.find({
// 		restaurant: "5edfaa7706364326f0b85c01",
// 	})
// 		.populate("foodItems")
// 		.exec((err, dish) => {
// 			dish.map((i) => i.foodItems.map((p) => console.log(p)));
// 		});
// });

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, Authorization"
	);
	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET, POST, PATCH, DELETE, OPTIONS"
	);
	next();
});

app.use(userRoutes);

// app.use((req, res, next) => {
// 	// res.sendFile(path.resolve(__dirname, "public", "index.html"));
// 	// res.json({ message: "" });
// 	next();
// });

app.use((req, res, next) => {
	console.log("Route couldn't found");
	const error = new HttpError("Route couldn't found", 404);
	throw error;
});

app.use((error, req, res, next) => {
	if (res.headerSent) {
		return next(error);
	}
	res.status(error.code || 500);
	res.json({ message: error.message || "An unknown error occurred" });
});

mongoose
	.connect(
		 //`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PWD}@cluster0-3qujd.mongodb.net/${process.env.DB_NAME}?retryWrites=true`
		`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PWD}@cluster0-n7ejg.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
	)
	.then(() => {
		app.listen(process.env.PORT || 5000);
	})
	.catch((err) => {
		console.log(err);
	});
