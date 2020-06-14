const mongoose = require("mongoose");

const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
	name: {
		type: String,
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
	cart: {
		items: [
			{
				restaurantId: {
					type: Schema.Types.ObjectId,
					ref: "Restaurant",
					required: true,
				},
				productId: {
					type: Schema.Types.ObjectId,
					ref: "Product",
					required: true,
				},
				quantity: { type: Number, required: true },
			},
		],
	},
	resetToken: String,
	resetTokenExpirationTime: Date,
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
