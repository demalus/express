
var express = require('../');
var request = require('supertest');

describe('implicit middleware', function() {

  var app = express();
  var middleApp = express();
  var leafApp = express();

  middleApp.with(function(req, res, next) {
    if (req.test) {
      next(new Error('req.test already set.'));
    }

    req.test = true;
    next();
  });

  function sendResult(req, res) {
    res.send(req.test || false);
  }

  app.get('/', sendResult);
  middleApp.get('/', sendResult);
  leafApp.get('/', sendResult);

  app.use('/middle', middleApp);
  middleApp.use('/leaf', leafApp);

  it('should be executed by routes in the same app/router', function(done) {
    request(app)
    .get('/middle')
    .expect(200, 'true', done);
  });

  it('should NOT be executed in other apps/routers (different mount-points)', function(done) {
    request(app)
    .get('/')
    .expect(200, 'false', function() {
      request(app)
      .get('/middle/leaf')
      .expect(200, 'false', done);
    });
  });

});
