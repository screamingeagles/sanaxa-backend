const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const addOnSchema = new Schema({
	restaurantId: {
		type: Schema.Types.ObjectId,
		ref: "Restaurant",
	},
	addOnName: {
		type: String,
		required: true,
	},
	requiredStatus: {
		type: Boolean,
		required: true,
	},
	multiSelection: {
		type: Boolean,
		required: true,
	},
	howMany: {
		type: Number,
		required: true,
	},
	items: [
		{
			name: {
				type: String,
			},
			description: {
				type: String,
			},
			price: {
				type: String,
			},
		},
	],
});

module.exports = mongoose.model("AddOn", addOnSchema);
