/// <reference path="studio.ts"/>
var Multiplayer = (function () {
    function Multiplayer() {
    }
    Multiplayer.init = function () {
        if (window.localStorage.getItem('blocked') === 'true') {
            Multiplayer.onClose();
            return;
        }
        Multiplayer.connection = new WebSocket('ws://' + Multiplayer.ip + ':' + Multiplayer.port + '/', 'donutstudio');
        Multiplayer.connection.addEventListener('message', Multiplayer.onMessage);
        Multiplayer.connection.addEventListener('open', Multiplayer.onOpen);
        Multiplayer.connection.addEventListener('close', Multiplayer.onClose);
    };
    Multiplayer.onOpen = function () {
        Multiplayer.sendWhenConnect.forEach(function (item) {
            Multiplayer.send(item[0], item[1]);
        });
    };
    Multiplayer.onMessage = function (event) {
        var packet = JSON.parse(event.data);
        switch (packet.type) {
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
                packet.data.donut.instance = new Donut(0.33, packet.data.donut.canvas.getContext('2d'));
                packet.data.donut.instance.setDecoration(packet.data.donut.decoration);
                packet.data.donut.instance.drawDonut();
                if (packet.data.id == Multiplayer.id) {
                    Studio.myDonut.setDecoration(packet.data.donut.decoration);
                    Studio.myDonut.drawDonut();
                }
                Multiplayer.users[packet.data.id] = packet.data;
                var div = document.createElement('div');
                div.id = 'user-' + packet.data.id;
                div.classList.add('mp-user');
                div.setAttribute('data-action', 'copy-donut');
                div.setAttribute('data-user', packet.data.id);
                div.appendChild(packet.data.donut.canvas);
                var name = document.createElement('div');
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
                var node = document.createElement('div');
                var nameNode = document.createElement('b');
                nameNode.classList.add('data-username-' + packet.data.user);
                nameNode.textContent = Multiplayer.users[packet.data.user]['name'];
                var msgNode = document.createElement('span');
                if (packet.data.html === true)
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
                var div = document.getElementById('user-' + packet.data);
                div.parentElement.removeChild(div);
                document.getElementById('mp-online-count').innerText = Multiplayer.usersCount.toString();
                break;
            case 'change-name':
                Multiplayer.users[packet.data.user]['name'] = packet.data.name;
                var nodelist = document.querySelectorAll('.data-username-' + packet.data.user);
                for (var i in nodelist) {
                    if (nodelist.hasOwnProperty(i))
                        nodelist[i].textContent = packet.data.name;
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
    };
    Multiplayer.onClose = function () {
        Studio.overlay(null);
        var nodelist = document.querySelectorAll('.multiplayer-item');
        for (var i in nodelist) {
            if (nodelist.hasOwnProperty(i))
                nodelist.item(i).style.display = 'none';
        }
    };
    Multiplayer.send = function (type, data) {
        if (Multiplayer.connection == null)
            return;
        if (Multiplayer.connection.readyState != 1) {
            Multiplayer.sendWhenConnect.push([type, data]);
            return;
        }
        var packet = { 'type': type, 'data': data };
        Multiplayer.connection.send(JSON.stringify(packet));
    };
    Multiplayer.close = function () {
        if (Multiplayer.connection == null)
            return;
        Multiplayer.connection.close();
    };
    Multiplayer.ip = 'ndat.nl';
    Multiplayer.port = 1337;
    Multiplayer.id = 0;
    Multiplayer.usersCount = 0;
    Multiplayer.users = [];
    Multiplayer.sendWhenConnect = [];
    return Multiplayer;
})();
//# sourceMappingURL=multiplayer.js.map