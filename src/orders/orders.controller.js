const path = require("path");
const orders = require(path.resolve("src/data/orders-data"));
const nextId = require("../utils/nextId");

function list(req, res, next) {
  res.json({ data: orders });
}

function create(req, res, next) {
  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;

  const validStatuses = ["pending", "preparing", "out-for-delivery", "delivered"];
  const status = "pending"; // Set default status to "pending"

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
    if (!("quantity" in dish)) {
      return next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }

    if (typeof dish.quantity !== "number" || dish.quantity <= 0) {
      return next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }
  }

  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    dishes,
    status,
  };

  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}


function read(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.json({ data: foundOrder });
  } else {
    next({
      status: 404,
      message: `Order with id ${orderId} not found.`,
    });
  }
}

function update(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  const validStatuses = ["pending", "preparing", "out-for-delivery", "delivered"];

  if (!foundOrder) {
    return next({
      status: 404,
      message: `Order with id ${orderId} not found.`,
    });
  }

  const { data: { id, status, ...order } = {} } = req.body;

  if (id && id !== orderId) {
    return next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`,
    });
  }

  if (status === "delivered" && foundOrder.status === "delivered") {
    return next({
      status: 400,
      message: "A delivered order cannot be changed.",
    });
  }
  
  if (!status || status === undefined || !validStatuses.includes(status)) {
    return next ({
      status: 400,
      message: "status"
    })
  }

  if (!order.deliverTo || order.deliverTo === "") {
    return next({
      status: 400,
      message: "Order must include a deliverTo",
    });
  }

  if (!order.mobileNumber || order.mobileNumber === "") {
    return next({
      status: 400,
      message: "Order must include a mobileNumber",
    });
  }

  if (!order.dishes || !Array.isArray(order.dishes) || order.dishes.length === 0) {
    return next({
      status: 400,
      message: "Order must include at least one dish",
    });
  }

  for (let index = 0; index < order.dishes.length; index++) {
    const dish = order.dishes[index];
    if (!("quantity" in dish)) {
      return next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }

    if (typeof dish.quantity !== "number" || dish.quantity <= 0) {
      return next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }
  }

  foundOrder.deliverTo = order.deliverTo;
  foundOrder.mobileNumber = order.mobileNumber;
  foundOrder.status = status; // Update the status
  foundOrder.dishes = order.dishes;

  res.json({ data: foundOrder });
}


function destroy(req, res, next) {
  const { orderId } = req.params;
  const foundIndex = orders.findIndex((order) => order.id === orderId);

  if (foundIndex === -1) {
    return next({
      status: 404,
      message: `Order with id ${orderId} not found.`,
    });
  }

  if (orders[foundIndex].status !== "pending") {
    return next({
      status: 400,
      message: "An order cannot be deleted unless it is pending.",
    });
  }

  orders.splice(foundIndex, 1);
  res.sendStatus(204);
}

module.exports = {
  list,
  create,
  read,
  update,
  destroy,
};