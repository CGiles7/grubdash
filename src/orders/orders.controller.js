const path = require("path");
const orders = require(path.resolve("src/data/orders-data"));
const nextId = require("../utils/nextId");

// Middleware to validate order data
function validateOrder(req, res, next) {
  const { data: orderData } = req.body;

  const validStatuses = ["pending", "preparing", "out-for-delivery", "delivered"];

  const { deliverTo, mobileNumber, dishes, status } = orderData;

  if (!deliverTo || deliverTo === "") {
    return next({
      status: 400,
      message: "Order must include a deliverTo",
    });
  }

  if (!mobileNumber || mobileNumber === "") {
    return next({
      status: 400,
      message: "Order must include a mobileNumber",
    });
  }

  if (!dishes || !Array.isArray(dishes) || dishes.length === 0) {
    return next({
      status: 400,
      message: "Order must include at least one dish",
    });
  }

  for (let index = 0; index < dishes.length; index++) {
    const dish = dishes[index];
    if (!("quantity" in dish) || typeof dish.quantity !== "number" || dish.quantity <= 0) {
      return next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }
  }

  if (status && !validStatuses.includes(status)) {
    return next({
      status: 400,
      message: "Invalid status",
    });
  }

  res.locals.orderData = orderData;
  next();
}

// Middleware to find an order by ID
function findOrderById(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);

  if (!foundOrder) {
    return next({
      status: 404,
      message: `Order with id ${orderId} not found.`,
    });
  }

  res.locals.foundOrder = foundOrder;
  next();
}

// Handler functions
function list(req, res, next) {
  res.json({ data: orders });
}

function create(req, res, next) {
  const newOrder = {
    id: nextId(),
    ...res.locals.orderData,
  };

  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function read(req, res, next) {
  res.json({ data: res.locals.foundOrder });
}

function update(req, res, next) {
  const { status, ...orderData } = res.locals.orderData;
  const foundOrder = res.locals.foundOrder;

  if (!status) {
    return next({
      status: 400,
      message: "status is required in the request.",
    });
  }

  if (req.body.data && req.body.data.id && req.body.data.id !== foundOrder.id) {
    return next({
      status: 400,
      message: `Request data id (${req.body.data.id}) does not match route orderId (${foundOrder.id}).`,
    });
  }

  if (status === "delivered" && foundOrder.status === "delivered") {
    return next({
      status: 400,
      message: "A delivered order cannot be changed.",
    });
  }

  if (req.body.data) {
    delete req.body.data.id;
    Object.assign(foundOrder, req.body.data);
  }

  foundOrder.status = status;

  res.json({ data: foundOrder });
}



function destroy(req, res, next) {
  const foundOrder = res.locals.foundOrder;

  if (foundOrder.status !== "pending") {
    return next({
      status: 400,
      message: "An order cannot be deleted unless it is pending.",
    });
  }

  const foundIndex = orders.findIndex((order) => order.id === foundOrder.id);
  orders.splice(foundIndex, 1);

  res.sendStatus(204);
}

module.exports = {
  list,
  create: [validateOrder, create],
  read: [findOrderById, read],
  update: [findOrderById, validateOrder, update],
  destroy: [findOrderById, destroy],
};
