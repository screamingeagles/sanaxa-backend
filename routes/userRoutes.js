const router = require("express").Router();

const { check } = require("express-validator");

const userContoller = require("../controllers/userController");

router.post(
	"/login",
	[
		check("email").normalizeEmail().isEmail(),
		check("password").isLength({ min: 6 }),
	],
	userContoller.login
);

router.post(
	"/signup",
	[
		// check("name").not().isEmpty(),
		check("email").normalizeEmail().isEmail(),
		check("password").isLength({ min: 6 }),
	],
	userContoller.signup
);

router.post("/userdetail", userContoller.getUser);

// router.post("/addtocart", userContoller.addtocart);

// router.post("/:id/cart", userContoller.fetchCart);

router.get("/allrestaurants", userContoller.fetchAllRestaurants);

router.post("/restaurant", userContoller.fetchSingleRestaurant);

module.exports = router;
