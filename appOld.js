// app.use("/", async (req, res, next) => {
// 	const newRestaurant = new Restaurant({
// 		name: "Newton Hotel",
// 		address: "Everywhere",
// 		tags: ["Best Quality"],
// 		rating: 2,
// 		deliveryTime: 60,
// 	});
// 	await newRestaurant.save();
// });

// app.use("/", async (req, res, next) => {
// 	const foodCategory = new FoodCategory({
// 		restaurant: "5ee3da54d8c4b3203065c34e",
// 		categoryName: "Chinese",
// 	});
// 	const cat = await foodCategory.save();
// 	console.log(cat);
// });

// app.use("/", async (req, res, next) => {
// 	const foodCategoryUid = "5ee3dcf8e1d0ed08fcdf05ab";
// 	const foodItems = new FoodItem({
// 		foodCategory: foodCategoryUid,
// 		foodList: { name: "Chinese 2", price: 120 },
// 	});
// 	try {
// 		const foodItemsListUpdated = await foodItems.save();
// 		const foodCategory = await FoodCategory.findById(foodCategoryUid);
// 		foodCategoryTempList = [
// 			...foodCategory.foodItems,
// 			foodItemsListUpdated._id,
// 		];
// 		foodCategory.foodItems = foodCategoryTempList;

// 		await foodCategory.save();
// 	} catch (err) {
// 		const error = new HttpError("Error, please", 404);
// 		throw error;
// 	}
// });

// app.use("/", async (req, res, next) => {
// 	const foodItemsListDetailsPage = await FoodCategory.find({
// 		restaurant: "5edfaa7706364326f0b85c01",
// 	})
// 		.populate("foodItems")
// 		.exec((err, dish) => {
// 			dish.map((i) => i.foodItems.map((p) => console.log(p)));
// 		});
// });