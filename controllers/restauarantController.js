const User = require("../models/user");
const Restaurant = require("../models/restaurant");
const FoodCategory = require("../models/foodcategory");
const Order = require("../models/order");
const RestaurantAdmin = require("../models/restaurantAdmin");

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

exports.signup = async (req, res, next) => {
	const {
		email,
		password,
		confirmpassword,
		gender,
		dob,
		newsletter,
		sms,
	} = req.body;
	if (password !== confirmpassword) {
		const err = new HttpError("Password does not match!", 500);
		return next(err);
    }
    
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
				return next(new HttpError("Please select your gender", 422));
			}
			if (err.param === "dob") {
				return next(new HttpError("Date of Birth is Required", 422));
			}
		});
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
