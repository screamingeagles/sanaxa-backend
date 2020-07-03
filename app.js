const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const MongoClient = require("mongodb").MongoClient;

const HttpError = require("./models/http-error").HttpError;

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
	// console.log("Route couldn't found");
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

// const uri = `mongodb//root:${process.env.DB_PWD}@cluster0-shard-00-00-n7ejg.mongodb.net:27017,cluster0-shard-00-01-n7ejg.mongodb.net:27017,cluster0-shard-00-02-n7ejg.mongodb.net:27017/${process.env.DB_NAME}?retryWrites=true&w=majority`;
// const client = new MongoClient(uri, { useNewUrlParser: true });
// client.connect((err) => {
// 	// perform actions on the collection object
// 	console.log("Yo");
// 	const server = app.listen(process.env.PORT || 5000);
// 	const io = require("./socket").init(server);
// 	io.on("connection", (server) => {
// 		// console.log("Client Connected", server.id);
// 		server.on("disconnect", () => {
// 			// console.log("User Disconnected");
// 		});
// 	});
// });

// mongoose
// 	.connect(
// 		`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PWD}@cluster0-n7ejg.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
// 		{ useNewUrlParser: true }
// 	)
// 	.then((result) => {
// 		console.log("Result", result);
// 		const server = app.listen(process.env.PORT || 5000);
// 		const io = require("./socket").init(server);
// 		io.on("connection", (server) => {
// 			// console.log("Client Connected", server.id);
// 			server.on("disconnect", () => {
// 				// console.log("User Disconnected");
// 			});
// 		});
// 	})
// 	.catch((err) => {
// 		console.log("Error", err);
// 	});

mongoose.set("useCreateIndex", true);
mongoose
	.connect(
		`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PWD}@cluster0-n7ejg.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
		{ useNewUrlParser: true, useUnifiedTopology: true }
	)
	.then((result) => {
		console.log("Yo");
		const server = app.listen(process.env.PORT || 5000);
		const io = require("./socket").init(server);
		io.on("connection", (server) => {
			// console.log("Client Connected", server.id);
			server.on("disconnect", () => {
				// console.log("User Disconnected");
			});
		});
	})
	.catch((err) => {
		console.log("Error", err);
	});
