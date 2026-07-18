const { Router } = require("express");
const controller = require("../controllers/cart.controller");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const { wishlistSchema } = require("../validators/cart.schema");

const router = Router();

router.use(authenticate, authorize("CLIENT"));

router.get("/", controller.getWishlist);
router.post("/", validate(wishlistSchema), controller.addToWishlist);
router.delete("/:productId", controller.removeFromWishlist);

module.exports = router;
