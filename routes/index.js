'use strict';

let express = require('express')
  , router = express.Router()
  , Controller = require('../controllers/controller')
  ;

let appRouter = function(options) {
  let controller = new Controller(options);

  router.use('/controller', (controller.getRouter()).bind(controller));

  router.get('/', function(req, res) {
    res.send({ status : "OK"})
  });

  return router;
};

module.exports = appRouter;