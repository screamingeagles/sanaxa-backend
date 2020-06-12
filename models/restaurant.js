const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const restaurantSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	address: {
		type: String,
		required: true,
	},
	rating: {
		type: Number,
	},
	tags: [],
	deliveryTime: {
		type: Number,
	},
});

module.exports = mongoose.model("Restaurant", restaurantSchema);
