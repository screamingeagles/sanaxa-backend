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
});

module.exports = mongoose.model("FoodCategory", foodCategorySchema);
