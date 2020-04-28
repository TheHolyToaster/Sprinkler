var Gpio = require('onoff').Gpio; 
var CH1 = new Gpio(22, 'out'),
    CH2 = new Gpio(23, 'out'),
    CH3 = new Gpio(24, 'out'),
    CH4 = new Gpio(25, 'out');

var ZONEs = [CH1, CH2, CH3, CH4];
var http = require('http').createServer(handler); 
var fs = require('fs'); 
var io = require('socket.io')(http) 


http.listen(1234); 

function handler (req, res) { 
  fs.readFile(__dirname + '/public/index.html', function(err, data) { 
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/html'}); 
      return res.end("404 Not Found");
    }
    res.writeHead(200, {'Content-Type': 'text/html'}); 
    res.write(data); 
    return res.end();
  });
}


io.sockets.on('connection', function (socket) {
  socket.on('zone1', function(data) { //get light switch status from client
    var zonevalue = data;
    if (zonevalue != CH1.readSync()) { //only change LED if status has changed
      CH1.writeSync(zonevalue); //turn LED on or off
    }
      socket.emit('event', zonevalue + ' #1'); //send button status to client
  });

});



process.on('SIGINT', function () { //on ctrl+c
  
 CH1.writeSync(0);
  CH1.unexport();  

 CH2.writeSync(0);  
  CH2.unexport();  

 CH3.writeSync(0); 
  CH3.unexport();  

 CH4.writeSync(0);  
  CH4.unexport(); 
  
  
  process.exit(); //exit completely
});



