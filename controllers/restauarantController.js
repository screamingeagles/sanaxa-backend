const User = require("../models/user");
const Restaurant = require("../models/restaurant");
const FoodCategory = require("../models/foodcategory");
const FoodItem = require("../models/fooditem");
const Order = require("../models/order");
const RestaurantAdmin = require("../models/restaurantAdmin");
const AddOn = require("../models/addon");

const io = require("../socket");

const HttpError = require("../models/http-error").HttpError;

const { validationResult } = require("express-validator");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

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

exports.partner = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		errors.errors.map((err) => {
			if (err.param === "email") {
				return next(new HttpError("Email must be valid", 422));
			}
			if (err.param === "fname") {
				return next(new HttpError("First Name is Required", 422));
			}
			if (err.param === "lname") {
				return next(new HttpError("Last Name is Required", 422));
			}
			if (err.param === "mobilenumber") {
				return next(new HttpError("Mobile Number is Required", 422));
			}
			if (err.param === "name") {
				return next(new HttpError("Store Name is Required", 422));
			}
			if (err.param === "storetype") {
				return next(new HttpError("Store Type is Required", 422));
			}
			if (err.param === "country") {
				return next(new HttpError("Country is Required", 422));
			}
			if (err.param === "city") {
				return next(new HttpError("City is Required", 422));
			}
			if (err.param === "socialmedia") {
				return next(new HttpError("Social Media  URL is not valid", 422));
			}
		});
	}
	const {
		email,
		fname,
		lname,
		mobilenumber,
		name,
		storetype,
		country,
		city,
		socialmedia,
	} = req.body;
	let existingRestaurant;

	try {
		existingRestaurant = await RestaurantAdmin.findOne({ email: email });
	} catch (error) {
		const err = new HttpError("Something went wrong, signing up failed", 500);
		return next(err);
	}
	if (existingRestaurant) {
		const err = new HttpError(
			"Restaurant with provided email exists already!",
			500
		);
		return next(err);
	}
	const createdRestaurant = new RestaurantAdmin({
		email,
		fname,
		lname,
		mobilenumber,
		name,
		storetype,
		country,
		city,
		socialmedia,
	});
	let restaurant;
	try {
		restaurant = await createdRestaurant.save();
	} catch (error) {
		return next(new HttpError("Couldn't create Restaurant", 500));
	}
	res.status(201).json({
		restaurantId: restaurant.id,
		email: restaurant.email,
	});
};

exports.register = async (req, res, next) => {
	const {
		email,
		password,
		confirmpassword,
		gender,
		dob,
		newsletter,
		sms,
	} = req.body;

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		errors.errors.map((err) => {
			if (err.param === "email") {
				return next(new HttpError("Email must be valid", 422));
			}
			if (err.param === "password") {
				return next(new HttpError("Please enter a valid password", 422));
			}
			if (err.param === "gender") {
				return next(new HttpError("Gender is required", 422));
			}
			if (err.param === "dob") {
				return next(new HttpError("Date of Birth is Required", 422));
			}
		});
	}
	if (password !== confirmpassword) {
		const err = new HttpError("Password does not match!", 500);
		return next(err);
	}

	let existingRestaurant;

	try {
		existingRestaurant = await RestaurantAdmin.findOne({ email: email });
	} catch (error) {
		const err = new HttpError("Something went wrong, signing up failed", 500);
		return next(err);
	}
	if (!existingRestaurant) {
		const err = new HttpError(
			"Restaurant with provided email doesn't exists",
			500
		);
		return next(err);
	}
	let hashedPassword;
	try {
		hashedPassword = await bcrypt.hash(password, 12);
	} catch (error) {
		return next(new HttpError("Could not create user, try again", 500));
	}
	if (existingRestaurant.password) {
		const err = new HttpError("You are already signed up!", 500);
		return next(err);
	}
	if (existingRestaurant) {
		existingRestaurant.password = hashedPassword;
		existingRestaurant.gender = gender;
		existingRestaurant.dob = dob;
		existingRestaurant.newsletter = newsletter;
		existingRestaurant.sms = sms;
		await existingRestaurant.save();
		const newRestaurant = new Restaurant({
			restaurant: existingRestaurant._id,
			name: existingRestaurant.name,
			rating: 0,
			active: true,
		});
		try {
			await newRestaurant.save();
		} catch (error) {
			// await RestaurantAdmin.deleteOne({ _id: restaurant._id });
			return next(new HttpError("Couldn't create Restaurant", 500));
		}
	}
	res.status(201).json({
		restaurantId: existingRestaurant.id,
		email: existingRestaurant.email,
	});
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
	const { email, password } = req.body;
	let existingUser;

	try {
		existingUser = await RestaurantAdmin.findOne({ email: email });
	} catch (error) {
		const err = new HttpError("Something went wrong, logging in failed!", 500);
		return next(err);
	}

	if (!existingUser) {
		const err = new HttpError("Invalid credentials!", 401);
		return next(err);
	}
	if (!existingUser.password) {
		const err = new HttpError("Using this Email, please sign up first", 401);
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

	let token;
	try {
		token = jwt.sign(
			{ userId: existingUser.id, email: existingUser.email },
			"somekeygoodhai"
			// { expiresIn: "1h" }
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

exports.dashboard = async (req, res, next) => {
	const userId = req.userData.userId;
	const existingRestaurants = await Restaurant.find({ restaurant: userId });

	const products = await FoodCategory.find({
		restaurant: existingRestaurants,
	}).populate("foodItems");
	// console.log(
	// 	products.map((i) => {
	// 		i.foodItems.populate("addOnList");
	// 	})
	// );
	let addons;
	try {
		addons = await AddOn.find({
			restaurantId: userId,
		});
	} catch (error) {}

	const Orders = await Order.find({
		restaurantId: existingRestaurants[0]._id,
	});
	// .populate("userId");

	let totalCustomers = [...new Set(Orders.map((i) => i.userId.toString()))];

	const customers = await User.find(
		{ _id: { $in: totalCustomers } },
		(err, customer) => {
			// console.log(customer);
		}
	);

	let totalSales = 0;

	Orders.map((i) =>
		i.items.map((j) => {
			totalSales += parseFloat(j.quantity) * parseFloat(j.price);
		})
	);

	res.status(200).json({
		// customers,
		// Orders,
		// products,
		addons,
		totalSales,
		totalOrders: Orders.length,
		totalCustomers: totalCustomers.length,
	});
};

exports.addCategory = async (req, res, next) => {
	const { categoryName, textArea, priority } = req.body;
	const userId = req.userData.userId;
	const existingRestaurant = await Restaurant.find({ restaurant: userId });
	const foodCategory = new FoodCategory({
		restaurant: existingRestaurant[0]._id,
		categoryName,
		textArea,
		priority,
		status: "Active",
	});
	const cat = await foodCategory.save();
	res.status(200).json({ message: "OK", userId, existingRestaurant, cat });
};

exports.addItem = async (req, res, next) => {
	const {
		foodCategory,
		name,
		description,
		price,
		priceOnSelection,
		addOnList,
	} = req.body;
	const userId = req.userData.userId;
	const foodItems = new FoodItem({
		foodCategory,
		foodList: { name, price, description },
		status: "Active",
		addOnList,
		priceOnSelection,
	});
	let cat;
	try {
		const foodItemsListUpdated = await foodItems.save();
		const foodCategoryItem = await FoodCategory.findById(foodCategory);
		foodCategoryTempList = [
			...foodCategoryItem.foodItems,
			foodItemsListUpdated._id,
		];
		foodCategoryItem.foodItems = foodCategoryTempList;

		cat = await foodCategoryItem.save();
	} catch (err) {
		const error = new HttpError("Error, please", 404);
		throw error;
	}
	res.status(200).json({ message: "OK", userId, cat });
};

exports.addAddOn = async (req, res, next) => {
	const {
		addOnName,
		requiredStatus,
		multiSelection,
		howMany,
		howManyMaximum,
		selectAll,
		items,
	} = req.body;
	const userId = req.userData.userId;
	const addOnItems = new AddOn({
		restaurantId: userId,
		addOnName,
		requiredStatus,
		multiSelection,
		howMany,
		howManyMaximum,
		selectAll,
		items,
	});
	let addOns;
	try {
		addOns = await addOnItems.save();
	} catch (err) {}
	res.status(200).json({ message: "OK", addOns });
};

exports.orderManagement = async (req, res, next) => {
	const userId = req.userData.userId;
	const existingRestaurants = await Restaurant.find({ restaurant: userId });

	const Orders = await Order.find({
		restaurantId: existingRestaurants[0]._id,
		orderStatus: "Pending" || "Dispatched" || "Confirmed",
	});
	res.status(200).json({ message: "OK", Orders });
};

exports.orderDetails = async (req, res, next) => {
	const { orderId } = req.body;
	const order = await Order.findById({ _id: orderId });
	res.status(200).json({ message: "OK", order });
};

exports.orderStatusUpdate = async (req, res, next) => {
	const { orderId, orderStatus } = req.body;
	const order = await Order.findById({ _id: orderId });
	order.orderStatus = orderStatus;
	let orderNew = await order.save();
	res.status(200).json({ message: "OK", orderNew });
};

exports.kitchenManagementCategories = async (req, res, next) => {
	const userId = req.userData.userId;
	const existingRestaurants = await Restaurant.find({ restaurant: userId });
	res.status(200).json({ message: "OK" });
};
