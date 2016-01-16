/// <reference path="studio.ts"/>

class Donut{
	private scale:number;
	private context:CanvasRenderingContext2D;

	private decoration:string[][] = [];

	constructor(scale:number, context:CanvasRenderingContext2D){
		this.scale = scale;
		this.context = context;
	}

	public addDecoration(sprite:string[]):void{
		if(!('rot' in sprite))
			sprite['rot'] = Math.floor(Math.random() * 360);

		this.decoration.push(sprite);
	}

	public reset():void{
		this.decoration = [];
	}

	public copyDecorationFrom(copyFrom:Donut):void{
		this.decoration = copyFrom.decoration;
	}

	public undoDecoration():void{
		if(this.decoration.length > 1)
			this.decoration.pop();
	}

	public drawDonut():void{
		if(Studio.progress[0] != Studio.progress[1])
			return;

		this.context.clearRect(0, 0, 265 * this.scale, 265 * this.scale);

		var donut = this;
		this.decoration.forEach(function(sprite){
			var canvasX = (265 - sprite['width']) / 2 * donut.scale;
			var canvasY = (265 - sprite['height']) / 2 * donut.scale;

			donut.context.save();
			//donut.context.rotate(sprite['rot']); // ?!??!?
			donut.context.drawImage(Studio.spritesheetSVG, sprite['x'], sprite['y'], sprite['width'], sprite['height'], canvasX, canvasY, sprite['width'] * donut.scale, sprite['height'] * donut.scale);
			donut.context.restore();
		});
	}

	public getDecoration():string[][]{
		return this.decoration;
	}

	public setDecoration(decoration:string[][]){
		this.decoration = decoration;
	}
}