var express = require('express');
var app = module.exports = express();
var bodyParser = require('body-parser');

var printerJson = require('./printer.json');
var Printer = require('./lib/printer');

var daemon = require('./lib/daemon');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json()); // for parsing application/json

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.post('/print', daemon);

app.start = function () {
  app.printers = [];
  for(var host in printerJson) {
    var p = new Printer({host:host, skus:printerJson[host]});
    // p.connect();
    app.printers.push(p);
  }
  // start the web server
  return app.listen(3000, function() {
    app.emit('started');
    console.log('Web server listening at: 3000');
  });
}

// start the server if `$ node server.js`
if (require.main === module)
  app.start();
