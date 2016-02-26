var Printjob = require('node-escpos').printjob;
var Printer = require('../lib/printer');
var p = new Printer({host:'192.168.0.74'});

describe('Net Print', function() {

  before(function() {
    p.connect();
  });
  
  it('should ok', function() {
    var job = new Printjob();
    // job.text('ok-我们------------------x1');
    job.text("我们是蔬菜水果沙拉   x1");
    job.newLine();
    job.text('ok-------------------------');
    job.pad();
    job.cut();
   
    
    p.print(job);
  });
});