/// <reference path="donut.ts"/>
/// <reference path="multiplayer.ts"/>
var Studio = (function () {
    //private static music:HTMLAudioElement[];
    function Studio() {
        Studio.updateProgress();
        Studio.loadSprites();
        //Studio.loadMusic();
        Studio.myDonutCanvas = document.getElementById('donut');
        Studio.myDonut = new Donut(2, Studio.myDonutCanvas.getContext('2d'));
        Studio.resizeDonut();
        window.addEventListener('resize', Studio.resizeDonut);
        Studio.registerActions();
        Studio.updateProgress();
        Multiplayer.init();
    }
    Studio.registerActions = function () {
        function handler(event) {
            var element = event.target;
            if (element.parentNode.hasAttribute('data-action'))
                element = element.parentNode;
            var action = element.getAttribute('data-action');
            if (action == null)
                return;
            var actions = action.split(';');
            actions.forEach(function (action) {
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
                        Multiplayer.send('account', document.getElementById('account-username').value);
                        Studio.overlay(null);
                        break;
                    case 'chat':
                        event.preventDefault();
                        Multiplayer.send('chat', document.getElementById('mp-chat-msg').value);
                        document.getElementById('mp-chat-msg').value = '';
                        break;
                    default:
                        alert('unknown action: ' + action);
                }
            });
        }
        document.body.addEventListener('click', handler, false);
        document.body.addEventListener('submit', handler, false);
    };
    Studio.takeScreenshot = function () {
        var canvas = document.createElement('canvas');
        canvas.width = 265 * 10;
        canvas.height = 265 * 10;
        var donut = new Donut(10, canvas.getContext('2d'));
        donut.copyDecorationFrom(Studio.myDonut);
        donut.drawDonut();
        var link = document.createElement('a');
        link['download'] = 'donut.png';
        link.href = canvas.toDataURL();
        link.click();
    };
    Studio.resizeDonut = function () {
        Studio.myDonutCanvas.width = 265 * 2;
        Studio.myDonutCanvas.height = 265 * 2;
        Studio.myDonutCanvas.style.height = Studio.myDonutCanvas.offsetWidth + 'px';
        Studio.myDonut.drawDonut();
    };
    Studio.loadSprites = function () {
        var xmlHttpRequest = new XMLHttpRequest();
        xmlHttpRequest.addEventListener('readystatechange', function (event) {
            if (xmlHttpRequest.readyState == 4) {
                Studio.spritesheet = JSON.parse(xmlHttpRequest.response);
                Studio.spritesheetSVG = new Image(1369, 1233);
                Studio.spritesheetSVG.src = 'assets/img/donut/spritesheet.svg';
                Studio.spritesheetSVG.addEventListener('load', function () {
                    Studio.updateProgress();
                });
                Studio.updateProgress();
            }
        });
        xmlHttpRequest.open('GET', 'assets/img/donut/spritesheet.json', true);
        xmlHttpRequest.send();
    };
    Studio.addOptions = function () {
        for (var type in Studio.spritesheet) {
            Studio.spritesheet[type].forEach(function (sprite) {
                var canvas = document.createElement('canvas');
                canvas.classList.add('decoration');
                canvas.classList.add(type);
                canvas.width = 66.25;
                canvas.height = 66.25;
                canvas.setAttribute('data-action', (type == 'donut' ? 'new-donut;' : '') + 'addDecoration');
                canvas.setAttribute('data-sprite', JSON.stringify(sprite));
                var donut = new Donut(0.25, canvas.getContext('2d'));
                donut.addDecoration(sprite);
                donut.drawDonut();
                document.getElementById('donut-obj-' + type).appendChild(canvas);
            });
        }
    };
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
    Studio.updateProgress = function () {
        Studio.progress[0]++;
        document.getElementById('progress').innerText = Math.round(Studio.progress[0] / Studio.progress[1] * 100) + '%';
        if (Studio.progress[0] == Studio.progress[1]) {
            Studio.addOptions();
            Multiplayer.send('ready', null);
            document.getElementById('progress').style.display = 'none';
        }
    };
    Studio.overlay = function (type) {
        if (type == null) {
            document.getElementById('overlay').classList.remove('show');
            return;
        }
        document.getElementById('overlay').classList.add('show');
        document.getElementById('overlay-' + type).style.display = 'block';
    };
    Studio.spritesheet = [];
    Studio.progress = [0, 4];
    return Studio;
})();
window.addEventListener('load', function () {
    new Studio();
});
//# sourceMappingURL=studio.js.map