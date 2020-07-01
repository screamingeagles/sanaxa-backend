const router = require("express").Router();

const { check, body } = require("express-validator");

const restaurantController = require("../controllers/restauarantController");

const checkAuth = require("../middleware/check-auth");
const checkUser = require("../middleware/check-user");

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
	"/register",
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
	restaurantController.register
);

router.post(
	"/login",
	[
		check("email").normalizeEmail().isEmail(),
		check("password").trim().isLength({ min: 6 }),
	],
	restaurantController.login
);

router.use(checkAuth);
router.use(checkUser);

router.post("/dashboard", restaurantController.dashboard); // ======== <>

router.post("/order-management", restaurantController.orderManagement); // ======= <>

router.post("/order-details", restaurantController.orderDetails); // ======= <>

router.post("/order-details-status", restaurantController.orderStatusUpdate); // ======= <>

// router.post("/update-vendor", restaurantController.login);

router.post("/kitchen-management-categories", restaurantController.kitchenManagementCategories);

router.post("/add-category", restaurantController.addCategory); // ======== <>

router.post("/add-item", restaurantController.addItem); // ============ <>

router.post("/add-addon", restaurantController.addAddOn); // ============ <>

// router.post("/kitchen-menu", restaurantController.login);

module.exports = router;

// router.post("/customer-management", restaurantController.login);
// router.post("/restaurant-management", restaurantController.login);
// router.post("/add-customer", restaurantController.login);
