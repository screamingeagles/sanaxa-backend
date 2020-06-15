const User = require("../models/user");
const Restaurant = require("../models/restaurant");
const FoodCategory = require("../models/foodcategory");

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
				"SG.pRU3kAfCTg-2cEP5oA.49QuhaTZ0lalcc_LgjvPYdjNUkQlbca11rjwT3TXF58",
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
	const { email, name, password } = req.body;
	console.log(email, name, password);
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
		name,
		password: hashedPassword,
		// orders: [[], []],
	});
	try {
		await createdUser.save();
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
	console.log(user);
	res.json({ user: user });
};

// exports.addtocart = async (req, res, next) => {
// 	const { restaurantName, id, uid } = req.body;
// 	console.log(req.body);
// 	const user = await User.findById({ _id: uid });
// 	const cart = {
// 		restaurantName: restaurantName,
// 		id: id,
// 	};
// 	user.cart.push(cart);
// 	await user.save();
// 	console.log(user);
// 	res.json({ message: "Done" });
// };

// exports.fetchCart = async (req, res, next) => {
// 	const { restaurantName, id, uid } = req.body;
// 	console.log(req.body);
// 	const user = await User.findById({ _id: uid });
// 	console.log(user);
// 	res.json({ user: user.cart });
// };

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
