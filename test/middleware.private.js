
var express = require('../');
var request = require('supertest');

describe('private middleware', function() {
  describe('.use() with private mode', function() {

    var app = express(),
      middleApp = express(),
      leafApp = express();

    function incrementCount(req, res, next) {
      if (!req.count) {
        req.count = 0;
      }
      req.count++;
      next();
    }

    function sendCount(req, res) {
      res.send(typeof req.count === 'number' ? req.count.toString() : '0');
    }

    app.use(incrementCount);
    middleApp.use(incrementCount);
    middleApp.use(incrementCount, true);
    leafApp.use(incrementCount);

    app.use('/middle', middleApp);
    middleApp.use('/leaf', leafApp);

    app.get('/', sendCount);
    middleApp.get('/', sendCount);
    leafApp.get('/', sendCount);

    it('private middleware should be executed by a route within the router that has that middleware', function(done) {
      request(app)
      .get('/middle')
      .expect(200, '3', done);
    })

    it('private middleware should not be executed if in a sub-application', function(done) {
      request(app)
      .get('/middle/leaf')
      .expect(200, '3', done);
    })

  })
})
