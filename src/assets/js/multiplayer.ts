/// <reference path="studio.ts"/>

class Multiplayer{
	private static ip:string = 'ndat.nl';
	private static port:number = 1337;

	private static connection:WebSocket;

	private static id:number = 0;
	private static usersCount:number = 0;
	public static users:string[][] = [];

	private static sendWhenConnect:any[] = [];

	public static init():void{
		if(window.localStorage.getItem('blocked') === 'true') {
			Multiplayer.onClose();
			return;
		}

		Multiplayer.connection = new WebSocket('ws://' + Multiplayer.ip + ':' + Multiplayer.port + '/', 'donutstudio');

		Multiplayer.connection.addEventListener('message', Multiplayer.onMessage);
		Multiplayer.connection.addEventListener('open', Multiplayer.onOpen);
		Multiplayer.connection.addEventListener('close', Multiplayer.onClose);
	}

	private static onOpen():void{
		Multiplayer.sendWhenConnect.forEach(function(item){
			Multiplayer.send(item[0], item[1]);
		});
	}

	private static onMessage(event:MessageEvent):void{
		var packet = JSON.parse(event.data);

		switch(packet.type){
			case 'id':
				Multiplayer.id = packet.data;
				break;
			case 'account':
				Studio.overlay('account');
				break;
			case 'add-user':
				Multiplayer.usersCount++;

				packet.data.donut.canvas = document.createElement('canvas');
				packet.data.donut.canvas.width = 87.45;
				packet.data.donut.canvas.height = 87.45;

				packet.data.donut.instance = new Donut(0.33, (<HTMLCanvasElement> packet.data.donut.canvas).getContext('2d'));
				packet.data.donut.instance.setDecoration(packet.data.donut.decoration);
				packet.data.donut.instance.drawDonut();

				if(packet.data.id == Multiplayer.id){
					Studio.myDonut.setDecoration(packet.data.donut.decoration);
					Studio.myDonut.drawDonut();
				}

				Multiplayer.users[packet.data.id] = packet.data;

				var div:HTMLDivElement = document.createElement('div');
				div.id = 'user-' + packet.data.id;
				div.classList.add('mp-user');
				div.setAttribute('data-action', 'copy-donut');
				div.setAttribute('data-user', packet.data.id);
				div.appendChild(packet.data.donut.canvas);

				var name:HTMLDivElement = document.createElement('div');
				name.textContent = packet.data.name;
				name.classList.add('data-username-' + packet.data.id);
				name.classList.add('name');

				div.appendChild(name);

				document.getElementById('mp-users').appendChild(div);

				document.getElementById('mp-online-count').innerText = Multiplayer.usersCount.toString();
				break;
			case 'chat':
				var msg = '<b class="data-username-' + packet.data.user + '">' + Multiplayer.users[packet.data.user]['name'] + '</b>: ';
				msg += packet.data.msg;
				msg += '<br />';

				var node:HTMLDivElement = document.createElement('div');
				var nameNode:HTMLElement = document.createElement('b');
				nameNode.classList.add('data-username-' + packet.data.user);
				nameNode.textContent = Multiplayer.users[packet.data.user]['name'];

				var msgNode:HTMLSpanElement = document.createElement('span');

				if(packet.data.html === true)
					msgNode.innerHTML = packet.data.msg;
				else
					msgNode.textContent = ': ' + packet.data.msg;

				node.appendChild(nameNode);
				node.appendChild(msgNode);

				document.getElementById('mp-chatlog').appendChild(node);
				document.getElementById('mp-chatlog').scrollTop = document.getElementById('mp-chatlog').scrollHeight;
				break;
			case 'remove-user':
				Multiplayer.usersCount--;

				delete Multiplayer.users[packet.data];

				var div:HTMLDivElement = <HTMLDivElement> document.getElementById('user-' + packet.data);
				div.parentElement.removeChild(div);

				document.getElementById('mp-online-count').innerText = Multiplayer.usersCount.toString();

				break;
			case 'change-name':
				Multiplayer.users[packet.data.user]['name'] = packet.data.name;
				var nodelist:NodeList = document.querySelectorAll('.data-username-' + packet.data.user);

				for(var i in nodelist){
					if(nodelist.hasOwnProperty(i))
						(<HTMLElement> nodelist[i]).textContent = packet.data.name;
				}
				break;
			case 'donut':
				Multiplayer.users[packet.data.user]['donut']['decoration'] = packet.data.decoration;
				Multiplayer.users[packet.data.user]['donut']['instance'].setDecoration(packet.data.decoration);
				Multiplayer.users[packet.data.user]['donut']['instance'].drawDonut();
				break;
			case 'block':
				window.localStorage.setItem('blocked', 'true');
				break;
			default:
				console.log('Could not handle packet ' + packet.type + ', data=');
				console.log(packet.data);
		}
	}

	private static onClose():void{
		Studio.overlay(null);

		var nodelist:NodeList = document.querySelectorAll('.multiplayer-item');

		for(var i in nodelist){
			if(nodelist.hasOwnProperty(i))
				(<HTMLElement> nodelist.item(i)).style.display = 'none';
		}
	}

	public static send(type:string, data:any):void{
		if(Multiplayer.connection == null)
			return;

		if(Multiplayer.connection.readyState != 1) {
			Multiplayer.sendWhenConnect.push([type, data]);
			return;
		}

		var packet = {'type': type, 'data': data};

		Multiplayer.connection.send(JSON.stringify(packet));
	}

	public static close(){
		if(Multiplayer.connection == null)
			return;

		Multiplayer.connection.close();
	}
}