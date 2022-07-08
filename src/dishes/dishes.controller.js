const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function create(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
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

function hasName(req, res, next) {
  const { data: { name } = {} } = req.body;
  if (name) {
    return next();
  }
  next({ status: 400, message: "Dish must include a name." });
}

function hasDescription(req, res, next) {
  const { data: { description } = {} } = req.body;
  if (description) {
    return next();
  }
  next({ status: 400, message: "Dish must include a description." });
}

function hasAcceptablePrice(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (Number.isInteger(price) && price > 0) {
    return next();
  }
  next({
    status: 400,
    message: "Dish must have a price that is an integer greater than 0.",
  });
}

function hasPrice(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (price) {
    return next();
  }
  next({ status: 400, message: "Dish must include a price." });
}

function hasImage(req, res, next) {
  const { data: { image_url } = {} } = req.body;
  if (image_url) {
    return next();
  }
  next({ status: 400, message: "Dish must include a image_url." });
}

function list(req, res) {
  res.json({ data: dishes });
}

function dishExists(req, res, next) {
  const { dishesId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishesId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish does not exist: ${dishesId}`,
  });
}

function dishIdMatches(req, res, next) {
  const { dishesId } = req.params;
  const { data: { id } = {} } = req.body;
  const foundDish = dishes.find((dish) => dish.id === dishesId);
  if (!id || foundDish.id == id) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 400,
    message: `Dish id does not match route id. Dish: ${id}, Route: ${dishesId}`,
  });
}

function read(req, res, next) {
  res.json({ data: res.locals.dish });
}

function update(req, res) {
  let dish = res.locals.dish;
  const { data: { name, description, price, image_url } = {} } = req.body;

  if (dish !== req.body.data) {
    dish.name = name;
    dish.description = description;
    dish.price = price;
    dish.image_url = image_url;
  }

  res.json({ data: dish });
}

module.exports = {
  create: [
    hasName,
    hasDescription,
    hasAcceptablePrice,
    hasPrice,
    hasImage,
    create,
  ],
  list,
  read: [dishExists, read],
  update: [
    dishExists,
    hasName,
    hasAcceptablePrice,
    hasDescription,
    hasPrice,
    hasImage,
    dishIdMatches,
    update,
  ],
  dishExists,
};
