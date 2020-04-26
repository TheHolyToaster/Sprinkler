var Gpio = require('onoff').Gpio; 
var CH1 = new Gpio(22, 'out');
var CH2 = new Gpio(23, 'out');
var CH3 = new Gpio(24, 'out');
var CH4 = new Gpio(25, 'out');

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
  socket.on('zone2', function(data) { //get light switch status from client
    var zonevalue = data;
    if (zonevalue != CH2.readSync()) { //only change LED if status has changed
      CH2.writeSync(zonevalue); //turn LED on or off
    }
      socket.emit('event', zonevalue + ' #2'); //send button status to client
  });
  socket.on('zone3', function(data) { //get light switch status from client
    var zonevalue = data;
    if (zonevalue != CH3.readSync()) { //only change LED if status has changed
      CH3.writeSync(zonevalue); //turn LED on or off
    }
      socket.emit('event', zonevalue + ' #3'); //send button status to client
  });
  socket.on('zone4', function(data) { //get light switch status from client
    var zonevalue = data;
    if (zonevalue != CH4.readSync()) { //only change LED if status has changed
      CH4.writeSync(zonevalue); //turn LED on or off
    }
      socket.emit('event', zonevalue + ' #4'); //send button status to client
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



