const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const categoriesRoutes = require("./categories.routes");
const attributesRoutes = require("./attributes.routes");
const productsRoutes = require("./products.routes");
const ordersRoutes = require("./orders.routes");
const paymentsRoutes = require("./payments.routes");
const vendorsRoutes = require("./vendors.routes");
const settingsRoutes = require("./settings.routes");
const clientsRoutes = require("./clients.routes");
const addressesRoutes = require("./addresses.routes");
const ordersRoutes = require("./orders.routes");
const paymentsRoutes = require("./payments.routes");
const quotationsRoutes = require("./quotations.routes");
const quotationTemplatesRoutes = require("./quotationTemplates.routes");
const invoicesRoutes = require("./invoices.routes");
const depositInvoicesRoutes = require("./depositInvoices.routes");

router.use("/auth", authRoutes);
router.use("/categories", categoriesRoutes);
router.use("/attributes", attributesRoutes);
router.use("/products", productsRoutes);
router.use("/orders", ordersRoutes);
router.use("/payments", paymentsRoutes);
router.use("/vendors", vendorsRoutes);
router.use("/settings", settingsRoutes);
router.use("/clients", clientsRoutes);
router.use("/addresses", addressesRoutes);
router.use("/orders", ordersRoutes);
router.use("/payments", paymentsRoutes);
router.use("/quotations", quotationsRoutes);
router.use("/quotation-templates", quotationTemplatesRoutes);
router.use("/invoices", invoicesRoutes);
router.use("/deposit-invoices", depositInvoicesRoutes);

module.exports = router;
