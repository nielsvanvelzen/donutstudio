/// <reference path="studio.ts"/>
var Donut = (function () {
    function Donut(scale, context) {
        this.decoration = [];
        this.scale = scale;
        this.context = context;
    }
    Donut.prototype.addDecoration = function (sprite) {
        if (!('rot' in sprite))
            sprite['rot'] = Math.floor(Math.random() * 360);
        this.decoration.push(sprite);
    };
    Donut.prototype.reset = function () {
        this.decoration = [];
    };
    Donut.prototype.copyDecorationFrom = function (copyFrom) {
        this.decoration = copyFrom.decoration;
    };
    Donut.prototype.undoDecoration = function () {
        if (this.decoration.length > 1)
            this.decoration.pop();
    };
    Donut.prototype.drawDonut = function () {
        if (Studio.progress[0] != Studio.progress[1])
            return;
        this.context.clearRect(0, 0, 265 * this.scale, 265 * this.scale);
        var donut = this;
        this.decoration.forEach(function (sprite) {
            var canvasX = (265 - sprite['width']) / 2 * donut.scale;
            var canvasY = (265 - sprite['height']) / 2 * donut.scale;
            donut.context.save();
            //donut.context.rotate(sprite['rot']); // ?!??!?
            donut.context.drawImage(Studio.spritesheetSVG, sprite['x'], sprite['y'], sprite['width'], sprite['height'], canvasX, canvasY, sprite['width'] * donut.scale, sprite['height'] * donut.scale);
            donut.context.restore();
        });
    };
    Donut.prototype.getDecoration = function () {
        return this.decoration;
    };
    Donut.prototype.setDecoration = function (decoration) {
        this.decoration = decoration;
    };
    return Donut;
})();
//# sourceMappingURL=donut.js.map