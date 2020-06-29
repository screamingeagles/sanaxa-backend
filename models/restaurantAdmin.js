const mongoose = require("mongoose");

const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const restaurantAdminSchema = new Schema({
	fname: {
		type: String,
		required: true,
	},
	lname: {
		type: String,
		required: true,
	},
	mobilenumber: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		// required: true,
	},
	name: {
		type: String,
		required: true,
	},
	storetype: {
		type: String,
		required: true,
	},
	country: {
		type: String,
		required: true,
	},
	city: {
		type: String,
		required: true,
	},
	socialmedia: {
		type: String,
	},
	dob: {
		type: String,
		// required: true,
	},
	newsletter: {
		type: Boolean,
		// required: true,
	},
	sms: {
		type: Boolean,
		// required: true,
	},
	gender: {
		type: String,
		// required: true,
	},
});

restaurantAdminSchema.plugin(uniqueValidator);

module.exports = mongoose.model("RestaurantAdmin", restaurantAdminSchema);
