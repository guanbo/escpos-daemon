var Printjob = require('node-escpos').printjob;

var printer = require('../printer.json');

module.exports = function (req, res) {
  var data = req.body;
  var printers = req.app.printers;
  var unpairs = []

  data.items.forEach(function (item) {
    var result = printers.some(function (printer) {
      return printer.enqueue(item);
    });
    if(!result) {
      unpairs.push(item);
    }
  });
  
  printers.forEach(function (printer) {
    if(printer.queue.length > 0) {
      var j = new Printjob();
      j.setFont('B');
      j.text('订单号：'+data.orderId);
      j.setFont('A');
      j.newLine();
      j.text('---------------------------')
      j.newLine();
      printer.queue.forEach(function (item) {
        j.text(item);
        j.newLine();
      });
      j.pad();
      j.cut();
      
      printer.print(j);
    }
  });
  res.json(unpairs);
}