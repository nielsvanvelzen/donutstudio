var WebSocketServer = require('websocket').server;
var http = require('http');
var webServer = http.createServer().listen(1337, 'ndat.nl');
var server = new WebSocketServer({httpServer: webServer});
var idCounter = 111111;

var connections = [];
var users = {};

function sendAll(type, data){
	var packet = {'type': type, 'data': data};

	connections.forEach(function(connection) {
		connection.sendUTF(JSON.stringify(packet));
	});
}

function sendPacket(connection, type, data){
	var packet = {'type': type, 'data': data};

	connection.sendUTF(JSON.stringify(packet));
}

server.on('request', function(request){
	var connection = request.accept('donutstudio', request.origin);
	var id = idCounter++;
	var packets = [0, 0];

	sendPacket(connection, 'id', id);

	connections.push(connection);

	users[id] = {
		'id': id,
		'name': 'Guest #' + id,
		'donut': {
			'decoration': [
				{
					"x": 506,
					"y": 6,
					"width": "264",
					"height": "264"
				}
			]
		},

		'lastmsg': null
	};

	console.log(connection.remoteAddress + " connected - Protocol Version " + connection.webSocketVersion);

	connection.on('close', function(){
		console.log(connection.remoteAddress + " disconnected");
		sendAll('chat', {'user': id, 'msg': '<span style="color: green;"> disconnected.</span>', 'html': true});

		sendAll('remove-user', id);

		var index = connections.indexOf(connection);
		if(index !== -1)
			connections.splice(index, 1);

		delete users[id];
	});

	connection.on('message', function(message){
		var packet = JSON.parse(message.utf8Data);

		packets[0]++;

		if(packets[1] != new Date().getSeconds()){
			packets[1] = new Date().getSeconds();
			packets[0] = 1;
		}else if(packets[0] > 5) {

			if(packets[0] > 7 || packet.type == 'chat') {
				sendAll('chat', {'user': id, 'msg': '<span style="color: red;"> blocked from server.</span>', 'html': true});
				sendPacket(connection, 'block');
				connection.drop();
			}

			return;
		}

		switch(packet.type){
			case 'account':
				if(packet.data.trim().length < 3 || packet.data.length > 20){
					sendPacket(connection, 'account');
					break;
				}

				for(var userId in users) {
					if (users.hasOwnProperty(userId) && userId != id && users[id].name.toLowerCase() === packet.data.toLowerCase()) {
						sendPacket(connection, 'account');
						return;
					}
				}

				sendAll('chat', {'user': id, 'msg': '<span style="color: orange;"> changed name, old name was ' + users[id].name + '.</span>', 'html': true});

				users[id].name = packet.data;
				sendAll('change-name', {'user': id, 'name': packet.data});
				break;
			case 'donut':
				users[id].donut.decoration = packet.data;

				sendAll('donut', {'user': id, 'decoration': users[id].donut.decoration});
				break;
			case 'ready':
				sendAll('add-user', users[id]);

				for(var userId in users) {
					if(users.hasOwnProperty(userId) && userId != id)
						sendPacket(connection, 'add-user', users[userId]);
				}

				sendPacket(connection, 'account');
				sendAll('chat', {'user': id, 'msg': '<span style="color: green;"> connected.</span>', 'html': true});
				break;
			case 'chat':
				if(packet.data.trim() != users[id].lastmsg && packet.data.trim().length > 1 && packet.data.length < 140)
					sendAll('chat', {'user': id, 'msg': packet.data, 'html': false});


				users[id].lastmsg = packet.data;

				break;
			case 'stop':
				sendAll('chat', {'user': id, 'msg': '<span style="color: red;"> restarted the server.</span>', 'html': true});
				server.shutDown();
				webServer.close();
				break;

			default:
				console.log('Could not handle packet ' + packet.type);
		}
	});
});

console.log('Websocket server started');