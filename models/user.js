const mongoose = require("mongoose");

const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
	fname: {
		type: String,
		required: true,
	},
	lname: {
		type: String,
		required: true,
	},
	gender: {
		type: String,
		required: true,
	},
	date: {
		type: Date,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
		minlength: 6,
	},
	newsletter: {
		type: Boolean,
	},
	SMS: {
		type: Boolean,
	},
	cart: {
		restaurantId: {
			type: Schema.Types.ObjectId,
			ref: "Restaurant",
		},
		RestaurantName: {
			type: String,
		},
		items: [
			{
				productId: {
					type: Schema.Types.ObjectId,
					ref: "FoodItem",
					required: true,
				},
				name: {
					type: String,
				},
				price: {
					type: String,
				},
				quantity: { type: Number, required: true },
				addOns: [],
				addOnList: [],
			},
		],
	},
	resetToken: String,
	resetTokenExpirationTime: Date,
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
