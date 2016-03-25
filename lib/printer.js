var util = require('util');
var events = require('events');
var net = require('net');

var Printer = function (options) {
  this.host = options.host || '127.0.0.1';
  this.port = options.port || 9100;
  this.skus = options.skus || [];
  this.queue = [];
}

// Inherit from EventEmitter
util.inherits(Printer, events.EventEmitter);

Printer.prototype.connect = function (options, callback) {
  if(!options) {
    options = {};
    callback = function () {};
  } else if(typeof options === 'function') {
    callback = options;
    options = {};
  }
  options.host = options.host || this.host;
  options.port = options.port || this.port;
  
  return net.connect(options.port, options.host, callback);
};

Printer.prototype.hasSku = function (skuId) {
  return this.skus.indexOf(skuId) > -1;
};

Printer.prototype.enqueue = function (item) {
  var found = this.hasSku(item[0]);
  if(found) {
    this.queue.push(item);
  }
  return found;
};

Printer.prototype.print = function (printjob, callback) {
  callback = callback || function () {};
  this.queue = [];
  var client = this.connect(function () {
    var printData = printjob.printData();
    client.end(printData);
    client.once('end', function () {
      client.destroy();
      callback();
    });
  });
  
  client.on('error', function (err) {
    // console.log(arguments);
  })
};

module.exports = Printer;