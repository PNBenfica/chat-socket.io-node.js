var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

var users = [];
var usersTyping = [];

io.on('connection', function(socket){
  	var addedUser = false;

  	// send list of online users when it connects
  	socket.emit('list users', users);

	socket.on('new user', function(userName){
    	if (addedUser) return;
    	addedUser = true;

    	users.push(userName);
		socket.username = userName;
		io.emit('new user connected', userName);
	});

	socket.on('disconnect', function(){
		if (addedUser){
			var index = users.indexOf(socket.username);
			users.splice(index, 1);
			io.emit('user disconnected', socket.username);
		}
	});

	socket.on('chat message', function(msg){
		var index = usersTyping.indexOf(socket.username);
		if (usersTyping.indexOf(socket.username) !== -1)
			usersTyping.splice(index, 1);
		socket.broadcast.emit('chat message', {user: socket.username, msg: msg, usersTyping: usersTyping});
	});

	socket.on('typing', function(){
		if (addedUser && usersTyping.indexOf(socket.username) === -1){
			usersTyping.push(socket.username);
			socket.broadcast.emit('users typing', usersTyping);
		}
	});

	socket.on('not typing', function(){
		var index = usersTyping.indexOf(socket.username);
		usersTyping.splice(index, 1);
		io.emit('users typing', usersTyping);
	});
});

http.listen(3000, '0.0.0.0', function(){
  console.log('listening on *:3000');
});

	  // this is used to send to all connecting sockets
      //io.sockets.emit('eventToClient', { id: userid, name: username });
      // this is used to send to all connecting sockets except the sending one
      //socket.broadcast.emit('eventToClient',{ id: userid, name: username });
      // this is used to the sending one
      //socket.emit('eventToClient',{ id: userid, name: username });