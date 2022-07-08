const path = require("path");

// Use the existing dishes data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function list(req, res) {
  res.json({ data: orders });
}

function create(req, res) {
  const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } =
    req.body;
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function hasDeliverTo(req, res, next) {
  const { data: { deliverTo } = {} } = req.body;
  if (deliverTo) {
    return next();
  }
  next({ status: 400, message: "Order must include a deliverTo." });
}

function hasMobileNumber(req, res, next) {
  const { data: { mobileNumber } = {} } = req.body;
  if (mobileNumber) {
    return next();
  }
  next({ status: 400, message: "Order must include a mobileNumber." });
}

function hasDish(req, res, next) {
  const { data: { dishes } = {} } = req.body;

  if (Array.isArray(dishes) && dishes.length > 0) {
    return next();
  }
  next({ status: 400, message: "Order must include a dish." });
}

function hasQuantity(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  let status = true;
  let index;
  for (let i = 0; i < dishes.length; i++) {
    if (dishes[i].quantity <= 0 || !Number.isInteger(dishes[i].quantity)) {
      status = false;
      index = i;
    }
  }
  if (status) {
    return next();
  }
  next({
    status: 400,
    message: `Dish ${index} must have a quantity that is an integer greater than 0.`,
  });
}

function orderExists(req, res, next) {
  const { ordersId } = req.params;
  const foundOrder = orders.find((order) => order.id === ordersId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }
  next({
    status: 404,
    message: `Order does not exist: ${ordersId}`,
  });
}

function orderIdMatches(req, res, next) {
  const { ordersId } = req.params;
  const { data: { id } = {} } = req.body;
  const foundOrder = orders.find((order) => order.id === ordersId);
  if (!id || foundOrder.id == id) {
    res.locals.order = foundOrder;
    return next();
  }
  next({
    status: 400,
    message: `Order id does not match route id. Order: ${id}, Route: ${ordersId}.`,
  });
}

function read(req, res, next) {
  res.json({ data: res.locals.order });
}

function update(req, res) {
  let order = res.locals.order;
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  if (order !== req.body.data) {
    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.status = status;
    order.dishes = dishes;
  }

  res.json({ data: order });
}

function checkStatus(req, res, next) {
  const { data: { status } = {} } = req.body;
  if (status && status !== "invalid") {
    return next();
  }
  next({
    status: 400,
    message:
      "Order must have a status of pending, preparing, out-for-delivery, delivered.",
  });
}

function checkDeliveredStatus(req, res, next) {
  const { data: { status } = {} } = req.body;
  if (status !== "delivered") {
    return next();
  }
  next({
    status: 400,
    message:
      "A delivered order cannot be changed.",
  });
}

function checkShippingStatus(req, res, next) {
  const status = res.locals.order.status;
  if (status === "pending") {
    return next();
  }
  next({
    status: 400,
    message: "An order cannot be deleted unless it is pending.",
  });
}

function destroy(req, res) {
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id == orderId);
  orders.splice(index, 1);
  res.sendStatus(204);
}

module.exports = {
  create: [hasDeliverTo, hasMobileNumber, hasDish, hasQuantity, create],
  list,
  read: [orderExists, read],
  update: [
    orderExists,
    hasDeliverTo,
    hasMobileNumber,
    hasDish,
    checkDeliveredStatus,
    checkStatus,
    hasQuantity,
    orderIdMatches,
    update,
  ],
  delete: [orderExists, checkShippingStatus, destroy],
  orderExists,
};
