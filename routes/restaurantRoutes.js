const router = require("express").Router();

const { check, body } = require("express-validator");

const restaurantController = require("../controllers/restauarantController");

const checkAuth = require("../middleware/check-auth");

const HttpError = require("../models/http-error").HttpError;

router.post(
	"/partner",
	[
		check("fname").not().isEmpty(),
		check("lname").not().isEmpty(),
		check("mobilenumber").not().isEmpty(),
		check("email").normalizeEmail().isEmail(),
		check("name").not().isEmpty(),
		check("storetype").not().isEmpty(),
		check("country").not().isEmpty(),
		check("city").not().isEmpty(),
		check("socialmedia").isURL(),
	],
	restaurantController.partner
);

router.post(
	"/signup",
	[
		check("email").normalizeEmail().isEmail(),
		check("password").trim().isLength({ min: 6 }),
		body("confirmpassword").trim(),
		// .custom((value, { req }) => {
		// 	if (value !== req.body.password) {
		// 		console.log(value !== req.body.password);
		// 		throw new HttpError("Password does not match!", 500);
		// 	}
		// })
		check("gender").not().isEmpty(),
		check("dob").not().isEmpty(),
	],
	restaurantController.signup
);

router.post(
	"/login",
	[
		check("email").normalizeEmail().isEmail(),
		check("password").trim().isLength({ min: 6 }),
	],
	restaurantController.login
);

// router.use(checkAuth);

module.exports = router;
