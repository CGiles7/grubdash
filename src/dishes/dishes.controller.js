const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// Middleware to check if dish exists
function dishExists(req, res, next) {
  const dishId = req.params.dishId;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.foundDish = foundDish;
    next();
  } else {
    next({
      status: 404,
      message: `Dish not found with id: ${dishId}`,
    });
  }
}

// Middleware to validate dish data
function validateDish(req, res, next) {
  const { data: { name, description, price, image_url } = {} } = req.body;

  if (!name || name === "") {
    return next({
      status: 400,
      message: "Dish must include a name",
    });
  }

  if (!description || description === "") {
    return next({
      status: 400,
      message: "Dish must include a description",
    });
  }

  if (!price || typeof price !== "number" || price <= 0) {
    return next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0",
    });
  }

  if (!image_url || image_url === "") {
    return next({
      status: 400,
      message: "Dish must include an image_url",
    });
  }

  res.locals.newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };

  next();
}

// Handlers
function list(req, res) {
  res.json({ data: dishes });
}

function create(req, res) {
  const newDish = res.locals.newDish;
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function read(req, res) {
  const foundDish = res.locals.foundDish;
  res.json({ data: foundDish });
}

function update(req, res) {
  const foundDish = res.locals.foundDish;
  const { data: { id, name, description, price, image_url } = {} } = req.body;

  // Check if the id in the request body matches :dishId in the route
  if (id && id !== foundDish.id) {
    return res.status(400).json({ error: `Request body id (${id}) does not match route parameter id (${foundDish.id}).` });
  }

  foundDish.name = name;
  foundDish.description = description;
  foundDish.price = price;
  foundDish.image_url = image_url;

  res.json({ data: foundDish });
}

function destroy(req, res) {
  const dishId = req.params.dishId;
  const foundDishIndex = dishes.findIndex((dish) => dish.id === dishId);

  const deletedDish = dishes.splice(foundDishIndex, 1)[0];

  res.status(405).json({
    status: 405,
    error: `Dish with id ${dishId} has been deleted`,
  });
}

module.exports = {
  list,
  create: [validateDish, create],
  read: [dishExists, read],
  update: [dishExists, validateDish, update],
  destroy: [destroy],
};
