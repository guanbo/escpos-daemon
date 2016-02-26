var express = require('express');
var app = module.exports = express();
var bodyParser = require('body-parser');

var printerJson = require('./printer.json');
var Printer = require('./lib/printer');
var fs = require('fs');

var daemon = require('./lib/daemon');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.set('view engine', 'jade');

app.get('/', function (req, res) {
  res.render('index', {printers: app.printers});
});

app.post('/print', daemon);
app.post('/printers', function (req, res) {
  var host = req.body.host;
  var method = req.body.method || 'add';
  if(method === 'add') {
    app.printers.push(new Printer({host: host, skus:[]}));
  } else if(method === 'delete') {
    var index = -1
    var got = app.printers.some(function (printer, idx) {
      var found = printer.host === req.body.host;
      if(found) {
        index = idx;
      }
      return found;
    });
    if(got) {
      app.printers.splice(index);
    }
  }
  res.redirect('/');
});
app.post('/skus', function (req, res) {
  app.printers.some(function (printer) {
    var found = printer.host === req.body.host;
    if(found) {
      var method = req.body.method || 'add';
      if(method === 'add') {
        printer.skus.push(req.body.sku);
      } else if(method === 'delete') {
        var index = printer.skus.indexOf(req.body.sku);
        printer.skus.splice(index, 1);
      }
    }
    return found; 
  });
  res.redirect('/');
});

app.post('/setting', function (req, res) {
  var method = req.body.method || 'save';
  if(method === 'save') {
    savePrinters(function (err) {
      if(err) return res.send(err);
      res.redirect('/');
    });
  } else if(method === 'reset') {
    restorePrinters();
    res.redirect('/');
  }
});

function restorePrinters() {
  app.printers = [];
  for(var host in printerJson) {
    var p = new Printer({host:host, skus:printerJson[host].slice(0)});
    app.printers.push(p);
  }
}

function savePrinters(callback) {
  printerJson = {}
  app.printers.forEach(function (printer) {
    printerJson[printer.host] = printer.skus;
  });
  fs.open('./printer.json', 'w', function (err, fd) {
    if(err) return callback(err);
    fs.write(fd, JSON.stringify(printerJson), function (err, written, string) {
      if(err) return callback(err);
      fs.close(fd, callback);
    });
  });
}

app.start = function () {
  restorePrinters()
  // start the web server
  return app.listen(3000, function() {
    app.emit('started');
    console.log('Web server listening at: 3000');
  });
}

// start the server if `$ node server.js`
if (require.main === module)
  app.start();
