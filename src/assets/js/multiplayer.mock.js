var Multiplayer = function(){
	function Multiplayer(){};

	Multiplayer.init = function(){};
	Multiplayer.onOpen = function(){};
	Multiplayer.onMessage = function(){};
	Multiplayer.onClose = function(){};
	Multiplayer.send = function(msg, data){
		if(msg == 'ready'){
			// Normally the server would do this. But I removed support for servers.
			Studio.myDonut.reset();

			for (var type in Studio.spritesheet)
				Studio.myDonut.addDecoration(Studio.spritesheet[type][Math.floor(Math.random() * Studio.spritesheet[type].length)]);

			Studio.myDonut.drawDonut();
		}
	};
	Multiplayer.close = function(){};

	Multiplayer.ip = '';
	Multiplayer.port = 0;
	Multiplayer.id = 0;
	Multiplayer.usersCount = 0;
	Multiplayer.users = [];
	Multiplayer.sendWhenConnect = [];

	return Multiplayer;
}();