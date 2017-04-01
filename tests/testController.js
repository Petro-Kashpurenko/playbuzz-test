"use strict";

// Basic unit tests for the controller.
// Should I write more for this exercise?

const Promise = require('promise');

const options = {
  mySQL: {
    host     : 'mysql-test.playbuzz.com',
    user     : 'root',
    password : 'Sharona12#',
    database : 'analytics_task'
  }
};

const Controller = require('../controllers/controller');
let controller, nodeGeoIp, res, useragent;

describe('controller test', function() {

  beforeEach(function() {
    useragent = jasmine.createSpyObj('useragent', ['parse']);
    nodeGeoIp = jasmine.createSpyObj('nodeGeoIp', ['lookup']);
    res = jasmine.createSpyObj('res', ['status', 'send']);
    res.status.and.returnValue(res);
    res.send.and.returnValue(res);

    controller = new Controller(options);
  });

  // Simple partial static method test...

  it('Should validate fields using regex', function() {
    // Very basic one, just for example.
    let nameRegex = /^[a-zA-Z]+$/;
    let invalidValue = 'Name$';
    let validValue = 'Name';

    expect(Controller.validate(invalidValue, nameRegex)).toBe(false);
    expect(Controller.validate(validValue, nameRegex)).toBe(true);
  });

  // API handler method test...

  it('Class collect view to be called successfully', function (done) {
    let req = {
        headers: {
          "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36",
          "host": "localhost"
        },
        body: {
          userId: "Nobody",
          pageId: "Homepage",
          pageUrl: "http://test.com",
          screenResolution: "1024x768"
        },
        connection: {
          remoteAddress: "77.120.41.53"
        }
      };

    useragent.parse.and.returnValue('Chrome');
    spyOn(Controller, 'validate').and.returnValue(true);
    nodeGeoIp.lookup.and.returnValue({
      country: 'UA'
    });

    spyOn(controller.data, 'collectView').and.callFake((data) => {
      expect(data).toEqual({
        pageReferrer: "localhost",
        browser: "Chrome",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36",
        userId: "Nobody",
        pageId: "Homepage",
        pageUrl: "http://test.com",
        screenResolution: "1024x768",
        country: "UA"
      });

      return Promise.resolve({thisIs: "Result object"})
    });

    controller.collect(req, res);

    // Should pass all validations.
    expect(Controller.validate).toHaveBeenCalledWith('Nobody', jasmine.any(RegExp));
    expect(Controller.validate).toHaveBeenCalledWith('Homepage', jasmine.any(RegExp));
    expect(Controller.validate).toHaveBeenCalledWith('http://test.com', jasmine.any(RegExp));
    expect(Controller.validate).toHaveBeenCalledWith('1024x768', jasmine.any(RegExp));

    // Async check after promise resolved.
    setTimeout(() => {
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({thisIs: "Result object"});

      done();
    }, 0);
  });

  it('Class collect view to be called with server error (possibly DB error)', function (done) {
    let req = {
      headers: {
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36",
        host: "localhost"
      },
      body: {
        userId: "Nobody",
        pageId: "Homepage",
        pageUrl: "http://test.com",
        screenResolution: "1024x768"
      },
      connection: {
        remoteAddress: "77.120.41.53"
      }
    };

    useragent.parse.and.returnValue('Chrome');
    spyOn(Controller, 'validate').and.returnValue(true);
    nodeGeoIp.lookup.and.returnValue({
      country: 'UA'
    });

    spyOn(controller.data, 'collectView').and.callFake(() => {
      return Promise.reject({thisIs: "Fail"})
    });

    controller.collect(req, res);

    setTimeout(() => {
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({thisIs: "Fail"});

      done();
    }, 0);
  });

  // Another failure...

  it('Class collect view to be called with user input error', function (done) {
    let req = {
      headers: {
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36",
        host: "localhost"
      },
      body: {
        userId: "asasasas asdasd$BrOkEn"
      },
      connection: {
        remoteAddress: "77.120.41.53"
      }
    };

    useragent.parse.and.returnValue('Chrome');
    spyOn(Controller, 'validate').and.returnValue(false);

    controller.collect(req, res);

    setTimeout(() => {
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({message: "Wrong userId value"});

      done();
    }, 0);
  });

});