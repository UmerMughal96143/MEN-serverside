const path = require('path');

const express = require('express');
const Auth = require("../routemiddleware/is-auth");
const shopController = require('../controllers/shop');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart',Auth, shopController.getCart);

router.post('/cart',Auth, shopController.postCart);

router.post('/cart-delete-item',Auth, shopController.postCartDeleteProduct);


router.get("/checkout", Auth, shopController.getCheckout);


router.get("/checkout/success", shopController.getCheckoutSuccess);

router.get("/checkout/cancel", shopController.getCheckout);

router.get('/orders',Auth, shopController.getOrders);

module.exports = router;
