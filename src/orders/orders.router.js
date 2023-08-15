const router = require("express").Router();
const controller = require("./orders.controller");

router
  .route("/")
  .get(controller.list)
  .post(controller.create);

router
  .route("/:orderId")
  .get(controller.read)
  .put(controller.update)
  .delete(controller.destroy);

module.exports = router;
