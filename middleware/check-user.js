const HttpError = require("../models/http-error").HttpError;
const RestaurantAdmin = require("../models/restaurantAdmin");

module.exports = async (req, res, next) => {
	const { userId } = req.body;
	if (req.method === "OPTIONS") {
		return next();
	}
	if (userId !== req.userData.userId) {
		const err = new HttpError("Invalid credentials!", 401);
		return next(err);
	}
	let existingUser;
	try {
		existingUser = await RestaurantAdmin.findOne({ _id: userId });
		req.existingUser = existingUser;
	} catch (error) {
		const err = new HttpError("Something went wrong! Try again later...", 500);
		return next(err);
	}

	if (!existingUser) {
		const err = new HttpError("Invalid credentials!", 401);
		return next(err);
	}
	next();
};
