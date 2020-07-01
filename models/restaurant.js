const mongoose = require("mongoose");

const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const restaurantSchema = new Schema({
	restaurant: {
		type: mongoose.Types.ObjectId,
		required: true,
		ref: "RestaurantAdmin",
	},
	name: {
		type: String,
		required: true,
	},
	address: {
		type: String,
	},
	rating: {
		type: Number,
	},
	cuisines: [],
	deliveryTime: {
		type: Number,
	},
	active: {
		type: Boolean,
		required: true,
	},
});

restaurantSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Restaurant", restaurantSchema);
