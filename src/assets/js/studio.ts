/// <reference path="donut.ts"/>
/// <reference path="multiplayer.ts"/>

class Studio{
	public static spritesheet:string[][][] = [];

	private static myDonutCanvas:HTMLCanvasElement;
	public static myDonut:Donut;
	public static spritesheetSVG:HTMLImageElement;

	public static progress:number[] = [0, 4];

	//private static music:HTMLAudioElement[];

	constructor(){
		Studio.updateProgress();

		Studio.loadSprites();
		//Studio.loadMusic();

		Studio.myDonutCanvas = <HTMLCanvasElement> document.getElementById('donut');
		Studio.myDonut = new Donut(2, Studio.myDonutCanvas.getContext('2d'));

		Studio.resizeDonut();

		window.addEventListener('resize', Studio.resizeDonut);

		Studio.registerActions();
		Studio.updateProgress();

		Multiplayer.init();
	}

	private static registerActions():void{
		function handler(event:Event){
			var element:HTMLElement = <HTMLElement> event.target;

			if((<HTMLElement> element.parentNode).hasAttribute('data-action'))
				element = (<HTMLElement> element.parentNode);

			var action:string = element.getAttribute('data-action');

			if(action == null)
				return;

			var actions:string[] = action.split(';');

			actions.forEach(function(action) {
				switch (action.toLowerCase()) {
					case 'account':
						Studio.overlay('account');
						break;
					case 'screenshot':
						Studio.takeScreenshot();
						break;
					case 'adddecoration':
						Studio.myDonut.addDecoration(JSON.parse(element.getAttribute('data-sprite')));
						Studio.myDonut.drawDonut();

						Multiplayer.send('donut', Studio.myDonut.getDecoration());
						break;
					case 'new-donut':
						Studio.myDonut.reset();
						Studio.myDonut.addDecoration(Studio.spritesheet['donut'][Math.floor(Math.random() * Studio.spritesheet['donut'].length)]);
						Studio.myDonut.drawDonut();

						Multiplayer.send('donut', Studio.myDonut.getDecoration());
						break;
					case 'copy-donut':
						Studio.myDonut.setDecoration(Multiplayer.users[element.getAttribute('data-user')].donut.decoration);
						Studio.myDonut.drawDonut();

						Multiplayer.send('donut', Studio.myDonut.getDecoration());
						break;
					case 'random-donut':
						Studio.myDonut.reset();

						for (var type in Studio.spritesheet) {
							Studio.myDonut.addDecoration(Studio.spritesheet[type][Math.floor(Math.random() * Studio.spritesheet[type].length)]);
						}

						Studio.myDonut.drawDonut();

						Multiplayer.send('donut', Studio.myDonut.getDecoration());

						break;
					case 'undo':
						Studio.myDonut.undoDecoration();
						Studio.myDonut.drawDonut();

						Multiplayer.send('donut', Studio.myDonut.getDecoration());
						break;
					case 'create-account':
						event.preventDefault();

						Multiplayer.send('account', (<HTMLInputElement> document.getElementById('account-username')).value);
						Studio.overlay(null);
						break;
					case 'chat':
						event.preventDefault();

						Multiplayer.send('chat', (<HTMLInputElement> document.getElementById('mp-chat-msg')).value);
						(<HTMLInputElement> document.getElementById('mp-chat-msg')).value = '';
						break;
					default:
						alert('unknown action: ' + action);
				}
			});
		}

		document.body.addEventListener('click', handler, false);
		document.body.addEventListener('submit', handler, false);
	}

	private static takeScreenshot():void{
		var canvas:HTMLCanvasElement = document.createElement('canvas');
		canvas.width = 265 * 10;
		canvas.height = 265 * 10;

		var donut = new Donut(10, canvas.getContext('2d'));
		donut.copyDecorationFrom(Studio.myDonut);
		donut.drawDonut();

		var link:HTMLAnchorElement = document.createElement('a');
		link['download'] = 'donut.png';
		link.href = canvas.toDataURL();
		link.click();
	}

	private static resizeDonut():void{
		Studio.myDonutCanvas.width = 265 * 2;
		Studio.myDonutCanvas.height = 265 * 2;

		Studio.myDonutCanvas.style.height = Studio.myDonutCanvas.offsetWidth + 'px';

		Studio.myDonut.drawDonut();
	}

	private static loadSprites():void{
		var xmlHttpRequest = new XMLHttpRequest();

		xmlHttpRequest.addEventListener('readystatechange', function(event){
			if(xmlHttpRequest.readyState == 4){
				Studio.spritesheet = JSON.parse(xmlHttpRequest.response);

				Studio.spritesheetSVG = new Image(1369, 1233);
				Studio.spritesheetSVG.src = 'assets/img/donut/spritesheet.svg';
				Studio.spritesheetSVG.addEventListener('load', function(){
					Studio.updateProgress();
				});

				Studio.updateProgress();
			}
		});

		xmlHttpRequest.open('GET', 'assets/img/donut/spritesheet.json', true);
		xmlHttpRequest.send();
	}

	private static addOptions():void{
		for(var type in Studio.spritesheet){
			Studio.spritesheet[type].forEach(function(sprite:string[]){
				var canvas:HTMLCanvasElement = document.createElement('canvas');
				canvas.classList.add('decoration');
				canvas.classList.add(type);

				canvas.width = 66.25;
				canvas.height = 66.25;
				canvas.setAttribute('data-action', (type == 'donut' ? 'new-donut;' : '') + 'addDecoration');
				canvas.setAttribute('data-sprite', JSON.stringify(sprite));

				var donut:Donut = new Donut(0.25, canvas.getContext('2d'));

				donut.addDecoration(sprite);
				donut.drawDonut();

				document.getElementById('donut-obj-' + type).appendChild(canvas);
			});
		}
	}

	/*private static loadMusic():void{
		Studio.music = [new Audio('assets/sound/music.ogg'), new Audio('assets/sound/music.ogg')];

		Studio.music[0].preload = "auto";
		Studio.music[1].preload = "auto";

		Studio.music[0].autoplay = false;

		Studio.music[0].addEventListener('timeupdate', function(){
			if(Studio.music[0].currentTime >= 10.444) {
				Studio.music[1].play();
				Studio.music[0].pause();
				Studio.music[0].currentTime = 0;
			}
		});

		Studio.music[1].addEventListener('timeupdate', function(){
			if(Studio.music[1].currentTime >= 10.444) {
				Studio.music[0].play();
				Studio.music[1].pause();
				Studio.music[1].currentTime = 0;
			}
		});

		Studio.music[0].addEventListener('canplay', Studio.updateProgress);
		Studio.music[1].addEventListener('canplay', Studio.updateProgress);
	}*/

	private static updateProgress():void{
		Studio.progress[0]++;

		document.getElementById('progress').innerText = Math.round(Studio.progress[0] / Studio.progress[1] * 100) + '%';

		if(Studio.progress[0] == Studio.progress[1]){
			Studio.addOptions();
			Multiplayer.send('ready', null);

			document.getElementById('progress').style.display = 'none';
		}
	}

	public static overlay(type):void{
		if(type == null){
			document.getElementById('overlay').classList.remove('show');
			return;
		}

		document.getElementById('overlay').classList.add('show');

		document.getElementById('overlay-' + type).style.display = 'block';
	}
}

window.addEventListener('load', function(){
	new Studio();
});