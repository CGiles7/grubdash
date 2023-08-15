const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function list(req, res) {
  res.json({ data: dishes });
}

function create(req, res, next) {
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

  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function read(req, res) {
  const dishId = req.params.dishId;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.json({ data: foundDish });
  } else {
    res.status(404).json({ error: `Dish not found with id: ${dishId}` });
  }
}

function update(req, res, next) {
  const dishId = req.params.dishId;
  const foundDish = dishes.find((dish) => dish.id === dishId);

  if (!foundDish) {
    return next({
      status: 404,
      message: `Dish with id ${dishId} not found`,
    });
  }

  const { data: { id, name, description, price, image_url } = {} } = req.body;

  if (id && id !== dishId) {
    return next({
      status: 400,
      message: `Dish id ${id} does not match :dishId ${dishId}`,
    });
  }

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

  if (!image_url || image_url === "") {
    return next({
      status: 400,
      message: "Dish must include an image_url",
    });
  }

  if (typeof price !== "number") {
    return next({
      status: 400,
      message: "Dish price must be a number",
    });
  }

  if (price <= 0) {
    return next({
      status: 400,
      message: "Dish price must be greater than 0",
    });
  }

  foundDish.name = name;
  foundDish.description = description;
  foundDish.price = price;
  foundDish.image_url = image_url;

  res.json({ data: foundDish });
}


function destroy(req, res, next) {
  const dishId = req.params.dishId;
  const foundDishIndex = dishes.findIndex((dish) => dish.id === dishId);

  if (foundDishIndex === -1) {
    return next({
      status: 405,
      message: `Dish with id ${dishId} does not exist`,
    });
  }

  const deletedDish = dishes.splice(foundDishIndex, 1)[0];

  res.status(405).json({
    status: 405,
    error: `Dish with id ${dishId} has been deleted`,
  });
}





module.exports = {
  list,
  create,
  read,
  update,
  destroy,
};


module.exports = {
  list,
  create,
  read,
  update,
  destroy,
};
