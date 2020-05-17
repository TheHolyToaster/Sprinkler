//hello!

var Gpio = require('onoff').Gpio; 
var http = require('http').createServer(handler); 
var fs = require('fs'); 
var io = require('socket.io')(http) 
var ON = 0;
var OFF = 1;

var index = 0;
var timer;
var _socket = null;

var SEC = 1000;
var MIN = SEC*60;
var HOUR = MIN*60;
var DAY = HOUR*24;

var CH1 = new Gpio(22, 'out'),
    CH2 = new Gpio(23, 'out'),
    CH3 = new Gpio(24, 'out'),
    CH4 = new Gpio(25, 'out');

var zone1 = {
  id : 0,
  channel : CH1, 
  name : "Zone 1",
  runTime : 30*MIN
};
var zone2 = {
  id : 1,
  channel : CH2, 
  name : "Zone 2",
  runTime : 30*MIN
};
var zone3 = {
  id : 2,
  channel : CH3, 
  name : "Zone 3",
  runTime : 30*MIN
};
var zone4 = {
  id : 3,
  channel : CH4, 
  name : "Zone 4",
  runTime : 30*MIN
};

var zones = [zone1, zone2, zone3, zone4];

setInterval(checkSchedule, 1*SEC);
var waterState = false;
var scheduleTime = {
  hour : 2,
  minute : 0,
  second : 0
};

console.log('starting webserver ');

http.listen(1234); 
resetZones();

function checkSchedule(){
  var now = new Date();
  var checkHour = now.getHours();
  var checkMin = now.getMinutes();
  var checkSec = now.getSeconds();

  // console.log(now.getHours()+':'+now.getMinutes()+':'+now.getSeconds());

  if (checkHour == scheduleTime.hour && 
    checkMin == scheduleTime.minute && 
    checkSec >= scheduleTime.second && 
    checkSec <= scheduleTime.second+5){
    if (waterState == false){
      console.log("Time has been reached.");
      loopZones();
    }
  }
};

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
  console.log('client connected '+socket);

_socket=socket;
  socket.on('length?', function(data) {

      socket.emit('length!', zones.length);
  });

  socket.on('zone', function(data) {
    console.log(data);
    resetZones();
    var value = (data.value)? ON:OFF;
    var id = data.id;
    setZone(id, value);
  });
  socket.on('loop', loopZones); 
  socket.on('reset', resetZones);
});

function setZone(id, value){
  console.log("set zone, id: "+id+" value: "+value);
  var z = zones[id];
  if (value != z.channel.readSync()) {
      z.channel.writeSync(value);
      if (_socket !== null) {
         console.log("send event to client");
         var event = {
           _id : id,
           _value : (value == ON)? true : false
         };
        _socket.emit('event', event );
      }
    }
};

function loopZones(){
  waterState = true;
  if (index >= zones.length) {
    resetZones();
    index = 0;
    waterState = false;
    return;
  };
  if (timer !== null) {
    clearTimeout(timer);
  }
  console.log('loop zones');
  resetZones();
  setZone(index, ON);
  timer = setTimeout(loopZones ,zones[index].runTime);
  ++index;
};

function resetZones(){
  console.log('reset zones');
  zones.forEach(function(z, id){
    setZone(id, OFF);
  });
};

process.on('SIGINT', function () {
  zones.forEach(function(z, id){
    setZone(id, ON);
    z.channel.unexport();  
  })  
  process.exit();
});