'use strict';

let express = require('express')
  , router = express.Router()
  , nodeGeoIp = require('geoip-lite')
  , useragent = require('useragent')
  ;

// Yes, converted ONLY this controller into the ES6 class apart from other components of this seed.
// Other parts of this seed are saved in objects...
// Not sure if I had to show if I can work with exact seed setup, so I saved it.
// I made a class for faster unit tests coverage here.

module.exports = class Controller {

  constructor(options) {
    this.data = require('../database/analyticsDataProvider')(options);
    this.nameRegex = /^[a-zA-Z]+$/;
    this.pageIdRegex = /^[a-zA-Z\d\-_]+$/;
    this.userIdRegex = /^[a-zA-Z\d\-_]+$/;
    this.pageUrlRegex = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    this.screenResolutionRegex = /^\d*x\d*$/;

    router.put('/collect', this.collect.bind(this) );

    router.get('/views/page/:id', (req, res) => {
      if(!Controller.validate(req.params.id, this.pageIdRegex)) {
        return res.status(400).end();
      }

      this.data.getPageViews({field: 'pageId', value: req.params.id || null})
        .then(function(response){
          res.status(200).send(response)
        });
    });

    router.get('/views/browser/:family?', (req, res) => {
      if(!Controller.validate(req.params.family, this.nameRegex)) {
        return res.status(400).end();
      }

      this.data.getPageViews({field: 'browser', value: req.params.family || null })
        .then(function(response){
          res.send(response)
        });
    });

    router.get('/views/country/:code?', (req, res) => {
      if(!Controller.validate(req.params.code, this.nameRegex)) {
        return res.status(400).end();
      }

      this.data.getPageViews({field: 'country', value: req.params.code || null })
        .then(function(response){
          res.send(response)
        });
    });

    router.get('/views/top-countries', (req, res) => {
      this.data.getPageViews({field: 'country', limit: 3})
        .then(function(response){
          res.send(response)
        });
    });

    this.router = router;
  }

  /**
   * Endpoint handler for collecting the analytics data.
   * @param req - request
   * @param res - response
   */
  collect( req, res ) {
    let analyticsRecord = {}
      , addressLookup
      , parsedUserAgent
    ;

    analyticsRecord.pageReferrer = req.headers.host;
    parsedUserAgent = useragent.parse(req.headers['user-agent']);
    analyticsRecord.browser = parsedUserAgent ? parsedUserAgent.family : '';
    analyticsRecord.userAgent = req.headers['user-agent'];

    // Errors might be combined in one error object and then sent with 400...
    // Fields might be mandatory checked...
    // So we always may come up with better error handling
    // , which is not the subject of this task I guess...
    if(!Controller.validate(req.body.userId, this.userIdRegex)) {
      return res.status(400).send({message: 'Wrong userId value'});
    }
    if(!Controller.validate(req.body.pageId, this.pageIdRegex)) {
      return res.status(400).send({message: 'Wrong pageId value'});
    }
    if(!Controller.validate(req.body.pageUrl, this.pageUrlRegex)) {
      return res.status(400).send({message: 'Wrong pageUrl value'});
    }
    if(!Controller.validate(req.body.screenResolution, this.screenResolutionRegex)) {
      return res.status(400).send({message: 'Wrong screenResolution value'});
    }

    analyticsRecord.userId = req.body.userId;
    analyticsRecord.pageId = req.body.pageId;
    analyticsRecord.pageUrl = req.body.pageUrl;
    analyticsRecord.screenResolution = req.body.screenResolution;

    addressLookup = nodeGeoIp.lookup(req.connection.remoteAddress); // for local test: '77.120.41.53'
    analyticsRecord.country = addressLookup ? addressLookup.country : '';

    this.data.collectView(analyticsRecord)
      .then((result) => {
        res.status(201).send(result);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }

  static validate(value, mask) {
    return !value || value.match(mask) !== null;
  }

  getRouter() {
    return this.router;
  };

};
