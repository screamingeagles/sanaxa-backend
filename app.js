const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const HttpError = require("./models/http-error").HttpError;

const User = require("./models/user");
const Restaurant = require("./models/restaurant");
const FoodCategory = require("./models/foodcategory");
const FoodItem = require("./models/fooditem");

const userRoutes = require("./routes/userRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");

const app = express();

app.use(bodyParser.json());

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

app.use("/customer", userRoutes);
app.use("/restaurant", restaurantRoutes);

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

// app.use((error, req, res, next) => {
// 	if (res.headerSent) {
// 		return next(error);
// 	}
// 	res.status(error.code || 500);
// 	res.json({ message: error.message || "An unknown error occurred" });
// });

app.use((error, req, res, next) => {
	const status = error.statusCode || 500;
	const message = error.message;
	const data = error.data;
	res.status(status).json({ message: message, data: data });
});

mongoose
	.connect(
		`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PWD}@cluster0-n7ejg.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
	)
	.then((result) => {
		const server = app.listen(process.env.PORT || 5000);
		const io = require("./socket").init(server);
		io.on("connection", (server) => {
			console.log("Client Connected", server.id);
			server.on("disconnect", () => {
				console.log("User Disconnected");
			});
		});
	})
	.catch((err) => {
		console.log(err);
	});
