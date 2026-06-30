const asyncHandler = require("../utils/async-handler");
const { successResponse } = require("../utils/response");
const svc = require("../services/marketplace.service");

const getProducts = asyncHandler(async (req, res) => {
  return successResponse(res, 200, "Products retrieved", await svc.listProducts());
});
const getProduct = asyncHandler(async (req, res) => {
  return successResponse(res, 200, "Product retrieved", await svc.getProductById(req.params.id));
});
const postOrder = asyncHandler(async (req, res) => {
  const { items, shipping_address, payment_method } = req.body;
  const order = await svc.createOrder(req.user.id, {
    items, shippingAddress: shipping_address, paymentMethod: payment_method,
  });
  return successResponse(res, 201, "Order created", order);
});
const getMyOrders = asyncHandler(async (req, res) => {
  return successResponse(res, 200, "Orders retrieved", await svc.listMyOrders(req.user.id));
});

module.exports = { getProducts, getProduct, postOrder, getMyOrders };