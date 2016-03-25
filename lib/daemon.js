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
      j.text(data.store);
      j.newLine();
      j.text('---------------------------')
      j.newLine();
      j.text(data.serialNumber+' ');
      j.text('订单号：'+data.orderId);
      j.newLine();
      j.text('---------------------------')
      j.newLine();
      printer.queue.forEach(function (item) {
        j.setFont('A');
        j.text(item[0]);
        j.newLine();
        j.setFont('B');
        j.text(item[1]+'  x  '+item[3]);
        j.newLine();
        j.text('------------------------')
        j.newLine();
      });
      j.setFont('A');
      j.newLine();
      j.text("成交时间："+data.dealAt);
      j.pad();
      j.cut();
      
      printer.print(j);
    }
  });
  res.json(unpairs);
}