var express = require('express')
var router = express.Router()

router.use('/controller', require('../controllers/controller'))

router.get('/', function(req, res) {
  res.send({ status : "OK"})
})

module.exports = router