const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const orderSchema = new Schema({
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
				ref: "Product",
				required: true,
			},
			name: {
				type: String,
			},
			price: {
				type: String,
			},
			quantity: { type: Number, required: true },
		},
	],
	orderStatus: {
		type: String,
	},
	userId: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: "User",
	},
});

module.exports = mongoose.model("Order", orderSchema);
