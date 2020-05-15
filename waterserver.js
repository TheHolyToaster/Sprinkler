var ON = 0;
var OFF = 1;

var Gpio = require('onoff').Gpio; 
var CH1 = new Gpio(22, 'out'),
    CH2 = new Gpio(23, 'out'),
    CH3 = new Gpio(24, 'out'),
    CH4 = new Gpio(25, 'out');

var ZONEs = [CH1, CH2, CH3, CH4];

var http = require('http').createServer(handler); 
var fs = require('fs'); 
var io = require('socket.io')(http) 

console.log('starting webserver ');

http.listen(1234); 
resetZones();

function handler (req, res) {
  console.log('new request');
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
  socket.on('length?', function(data) {
    
      socket.emit('length!', ZONEs.length);
  });

  socket.on('zone', function(data) {
    console.log(data);
    resetZones();
    var value = (data.value)? ON:OFF;
    var id = data.id;
    if (value != ZONEs[id].readSync()) {
      ZONEs[id].writeSync(value);
    }
      socket.emit('event', value + ' #1');
  });
  socket.on('loop', loopZones); 
  socket.on('reset', resetZones);
});

var index = 0;
var timer;

function loopZones(){
  if (index >= ZONEs.length) {
    resetZones();
    index = 0;
    return;
  };
  if (timer !== null) {
    clearTimeout(timer);
  }
  console.log('loop zones');
  resetZones();
  ZONEs[index].writeSync(ON);
  ++index;
  timer = setTimeout(loopZones ,1000);
};

function resetZones(){
  console.log('reset zones');
  ZONEs.forEach(function(z){
    z.writeSync(OFF);
  });
};



process.on('SIGINT', function () {
  ZONEs.forEach(function(z){
    z.writeSync(ON);
    z.unexport();  
  })
  process.exit();
});



