var app = require('../');

var superagent = require('superagent');
var prefix = require('superagent-prefix')('http://127.0.0.1:3000');

var post = function (route, json, done) {
  var req = superagent.post(route).use(prefix);
  req.send(json).end(done);
}

describe('Print Order', function() {
  
  before(function(done) {
    app.start();
    app.once('started', done);
  });
  
  it('should be ok', function(done) {
    
    var data = {
      orderId: '100001024163170',
      items: [
        ["2000282587", "韭菜【菜】约240g/份", "$3.2", "1"],
        ["2001380715", "豆芽头【菜】 约480g/份", "$6.6", "1"]
      ]
    };
    
    post('/print', data, function (err, res) {
      if(err) return done(err);
      setTimeout(function () {
        done();
      }, 1000);
      console.log(res.body);
      // done();
    });
    
  });
});