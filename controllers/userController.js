const User = require("../models/user");
const Restaurant = require("../models/restaurant");
const FoodCategory = require("../models/foodcategory");
const Order = require("../models/order");

const io = require("../socket");

const HttpError = require("../models/http-error").HttpError;

const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const crypto = require("crypto");
const nodemailer = require("nodemailer");
const sendGrid = require("nodemailer-sendgrid-transport");

const transporter = nodemailer.createTransport(
	sendGrid({
		auth: {
			api_key:
				"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",
		},
	})
);

exports.signup = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		errors.errors.map((err) => {
			if (err.param === "email") {
				return next(new HttpError("Email must be valid", 422));
			}
			if (err.param === "password") {
				return next(
					new HttpError("Password length must be greater than 6", 422)
				);
			}
			if (err.param === "name") {
				return next(new HttpError("Please enter a valid name", 422));
			}
		});
	}
	const {
		email,
		fname,
		lname,
		gender,
		date,
		password,
		newsletter,
		SMS,
	} = req.body;
	console.log(email, fname, lname, gender, date, password, newsletter, SMS);
	let existingUser;

	try {
		existingUser = await User.findOne({ email: email });
	} catch (error) {
		const err = new HttpError("Something went wrong, signing up failed", 500);
		return next(err);
	}
	if (existingUser) {
		const err = new HttpError("User exists already!", 500);
		return next(err);
	}
	let hashedPassword;
	try {
		hashedPassword = await bcrypt.hash(password, 12);
	} catch (error) {
		return next(new HttpError("Could not create user, try again", 500));
	}
	const createdUser = new User({
		email,
		password: hashedPassword,
		fname,
		lname,
		gender,
		date,
		newsletter,
		SMS,
	});
	try {
		await createdUser.save();
		transporter.sendMail({
			to: req.body.email,
			from: "sma3797@outlook.com",
			subject: "Snaxa Signup",
			html: `
				<h1>Snaxa</h1>
				<p>Thanks for signing up!</p>
				`,
		});
	} catch (error) {
		return next(new HttpError("Couldn't create user", 500));
	}
	res.status(201).json({ userId: createdUser.id, email: createdUser.email });
};

exports.login = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		errors.errors.map((err) => {
			if (err.param === "email") {
				return next(new HttpError("Email must be valid", 422));
			}
			if (err.param === "password") {
				return next(
					new HttpError("Password length must be greater than 6", 422)
				);
			}
		});
	}
	const { email, password, basket } = req.body;
	console.log(email, basket);
	let existingUser;

	try {
		existingUser = await User.findOne({ email: email });
	} catch (error) {
		const err = new HttpError("Something went wrong, logging in failed!", 500);
		return next(err);
	}

	if (!existingUser) {
		const err = new HttpError("Invalid credentials!", 401);
		return next(err);
	}

	let isValidPassword = false;
	try {
		isValidPassword = await bcrypt.compare(password, existingUser.password);
	} catch (error) {
		const err = new HttpError("Something went wrong, logging in failed", 500);
		return next(err);
	}
	if (!isValidPassword) {
		const err = new HttpError("Invalid credentials", 401);
		return next(err);
	}

	// const cart = ( )

	let token;
	try {
		token = jwt.sign(
			{ userId: existingUser.id, email: existingUser.email },
			"somekeygoodhai",
			{ expiresIn: "1h" }
		);
	} catch (error) {
		return next(new HttpError("Couldn't login", 500));
	}

	res.status(201).json({
		userId: existingUser.id,
		email: existingUser.email,
		token: token,
	});
};

exports.getUser = async (req, res, next) => {
	const userId = req.body.userId;
	let user;
	try {
		user = await User.findById({ _id: userId });
	} catch (error) {
		const err = new HttpError("Something went wrong", 500);
		return next(err);
	}
	res.json({ user: user });
};

exports.fetchAllRestaurants = async (req, res, next) => {
	const allRestaurants = await Restaurant.find();
	res.send({ allRestaurants });
};

exports.fetchSingleRestaurant = async (req, res, next) => {
	const restaurantId = req.body.restaurantId;
	let details = [];
	let categories = [];
	const foodItemsListDetailsPage = await FoodCategory.find({
		restaurant: restaurantId,
	})
		.populate("restaurant")
		.populate("foodItems")
		.exec((err, dish) => {
			// dish.map((i) => {
			// 	categories.push([i.categoryName, i.restaurant.name]);
			// 	return i.foodItems.map((p) => {
			// 		details.push(p);
			// 	});
			// });
			// res.send({ details, categories });c
			// res.send({ dish: { ...dish, restaurant: dish.restaurant.name } });
			res.send({ dish });
		});
	// console.log(details);
	// console.log(foodItemsListDetailsPage);
};

exports.addtobasket = async (req, res, next) => {
	const {
		restaurantId,
		RestaurantName,
		quantity,
		productId,
		name,
		price,
		totalPrice,
		userId,
	} = req.body;
	let user;
	user = await User.findById({ _id: userId });

	const existingProduct = user.cart.items.find(
		(i) => i.productId.toString() === productId.toString()
	);
	const existingProductIndex = user.cart.items.findIndex(
		(i) => i.productId.toString() === productId.toString()
	);

	if (existingProduct) {
		const tempProduct = existingProduct;
		tempProduct.quantity += quantity;
		user.cart.items[existingProductIndex] = tempProduct;
		const tempUser = await user.save();
		io.getIO().emit("add", {
			action: "add",
			user: tempUser.cart,
			userId,
			userId,
		});
		res.status(200).json({ message: "ADD TO CART" });
		return;
	}
	user.cart.RestaurantName = RestaurantName;
	user.cart.restaurantId = restaurantId;

	const cartData = {
		quantity,
		productId,
		name,
		price,
		totalPrice,
	};

	user.cart.items.push(cartData);
	const tempUser = await user.save();
	io.getIO().emit("add", { action: "add", user: tempUser.cart, userId });
	res.status(200).json({ message: "ADD TO CART" });
};

exports.fetchCart = async (req, res, next) => {
	const { userId } = req.body;
	let user;
	user = await User.findById({ _id: userId });
	console.log(user);
	io.getIO().emit("add", { action: "add", user: user.cart, userId });
	res.status(200).json({ user: user.cart });
	// res.json({ user: user.cart });
};

exports.oldBasket = async (req, res, next) => {
	// FILTER DATA PLEASE ------------------------------------------
	const { userId, tempCart } = req.body;
	const user = await User.findById({ _id: userId });
	user.cart = tempCart;
	const tempUser = await user.save();
	// io.getIO().emit("add", { action: "add", user: tempUser.cart, userId });
	res.status(200).json({ message: "ADD TO CART", user: tempUser.cart });
};

exports.clearBasket = async (req, res, next) => {
	//// FILTER DATA PLESE ------------------------------------------
	const { userId } = req.body;
	const user = await User.findById({ _id: userId });
	const tempItems = [];
	user.cart = {
		items: [],
	};
	user.cart.items = tempItems;
	const tempUser = await user.save();
	io.getIO().emit("add", { action: "add", user: tempUser.cart, userId });
	res.status(200).json({ message: "ADD TO CART" });
};

exports.removeProduct = async (req, res, next) => {
	//// FILTER DATA PLESE ------------------------------------------
	const { userId, productId } = req.body;
	const user = await User.findById({ _id: userId });

	const tempItems = user.cart.items.filter(
		(i) => i.productId.toString() !== productId
	);
	if (tempItems.length < 1) user.cart = { items: [] };
	user.cart.items = tempItems;

	const tempUser = await user.save();
	io.getIO().emit("add", {
		action: "add",
		user: tempUser.cart,
		userId,
		remove: false,
	});
	res.status(200).json({ message: "ADD TO CART" });
};

exports.addQuantity = async (req, res, next) => {
	//// FILTER DATA PLESE ------------------------------------------
	const { userId, productId, quantity } = req.body;
	const user = await User.findById({ _id: userId });

	const existedItem = user.cart.items.find(
		(i) => i.productId.toString() === productId
	);
	const existedItemIndex = user.cart.items.findIndex(
		(i) => i.productId.toString() === productId
	);
	// if (tempItems.length < 1) user.cart = { items: [] };
	if (existedItem) {
		existedItem.quantity += quantity;
		user.cart.items[existedItemIndex] = existedItem;
	}
	// user.cart.items = tempItems;
	const tempUser = await user.save();
	io.getIO().emit("add", { action: "add", user: tempUser.cart, userId });
	res.status(200).json({ message: "ADD TO CART", cart: tempUser.cart });
};

exports.checkout = async (req, res, next) => {
	const { userId } = req.body;
	const user = await User.findById({ _id: userId });
	const { RestaurantName, restaurantId, items } = user.cart;
	const order = new Order({
		orderStatus: "Pending",
		userId,
		RestaurantName,
		restaurantId,
		items,
	});
	await order.save();
	const tempItems = [];
	user.cart = {
		items: [],
	};
	user.cart.items = tempItems;
	const tempUser = await user.save();
	console.log(tempUser);
	io.getIO().emit("add", { action: "add", user: tempUser.cart, userId });
	res.status(200).json({ message: "Success" });
	// res.json({ message: "Success" });
};

exports.fetchOrderByUser = async (req, res, next) => {
	const { userId } = req.body;
	const order = await Order.find({ userId });

	res.status(200).json({ message: "SUCCESS", order });
};
