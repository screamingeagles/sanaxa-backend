const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const foodItemSchema = new Schema({
	foodCategory: {
		type: mongoose.Types.ObjectId,
		required: true,
	},
	foodList: { type: Object, required: true, ref: "FoodCategory" },
});

module.exports = mongoose.model("FoodItem", foodItemSchema);
