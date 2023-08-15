const router = require("express").Router();
const controller = require("./dishes.controller");

router
  .route("/")
  .get(controller.list)
  .post(controller.create);

router
  .route("/:dishId")
  .get(controller.read)
  .put(controller.update)
  .delete(controller.destroy);

module.exports = router;
