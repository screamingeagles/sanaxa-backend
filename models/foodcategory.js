const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const foodCategorySchema = new Schema({
	restaurant: {
		type: mongoose.Types.ObjectId,
		required: true,
		ref: "Restaurant",
	},
	categoryName: {
		type: Schema.Types.String,
		required: true,
	},
	foodItems: [{ type: mongoose.Types.ObjectId, ref: "FoodItem" }],
	priority: {
		type: Number,
	},
	textArea: {
		type: String,
	},
});

module.exports = mongoose.model("FoodCategory", foodCategorySchema);
