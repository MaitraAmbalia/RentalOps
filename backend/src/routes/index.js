const express = require("express");
const router = express.Router();
const authRoutes = require("./auth.routes");
const categoriesRoutes = require("./categories.routes");
const attributesRoutes = require("./attributes.routes");
const productsRoutes = require("./products.routes");
const ordersRoutes = require("./orders.routes");
const paymentsRoutes = require("./payments.routes");

router.use("/auth", authRoutes);
router.use("/categories", categoriesRoutes);
router.use("/attributes", attributesRoutes);
router.use("/products", productsRoutes);
router.use("/orders", ordersRoutes);
router.use("/payments", paymentsRoutes);

module.exports = router;
