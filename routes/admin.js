const path = require('path');
const Auth = require("../routemiddleware/is-auth");
const express = require('express');

const adminController = require('../controllers/admin');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', Auth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products',Auth, adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product',Auth, adminController.postAddProduct);

router.get("/edit-product/:productId", Auth,adminController.getEditProduct);

router.post("/edit-product", Auth,adminController.postEditProduct);

router.post('/delete-product',Auth, adminController.postDeleteProduct);

module.exports = router;
