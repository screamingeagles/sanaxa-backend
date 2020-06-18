const router = require("express").Router();

const { check } = require("express-validator");

const userContoller = require("../controllers/userController");
const checkAuth = require("../middleware/check-auth");

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

// router.post("/:id/cart", userContoller.fetchCart);

router.get("/allrestaurants", userContoller.fetchAllRestaurants);

router.post("/restaurant", userContoller.fetchSingleRestaurant);

router.use(checkAuth);

router.post("/addtobasket", userContoller.addtobasket);

router.post("/fetchbasket", userContoller.fetchCart);

router.post("/oldbasket", userContoller.oldBasket);

router.post("/clearbasket", userContoller.clearBasket);

router.post("/removeproduct", userContoller.removeProduct);

router.post("/addquantity", userContoller.addQuantity);

router.post("/checkout", userContoller.checkout);

router.post("/fetchorder", userContoller.fetchOrderByUser);

module.exports = router;
