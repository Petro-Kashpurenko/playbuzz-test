var express = require('express')
var router = express.Router()
var data = require('../database/analyticsDataProvider')

router.get('/:id', function(req, res) {
  data.get(function(val){
      res.send({ property: val})
  })
})

module.exports = router