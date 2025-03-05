const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const Format = require('../core/format').Format;
const Sender = require('../core/info').Sender;
const Log = require('../core/log').Log;
const chokidar = require('chokidar');

const config = require('./server.config.json');
const wsServer = new WebSocket.Server({ host: config.host, port: config.port });
wsServer.on('connection', onConnect);

let allUsers = {};

function onConnect(wsClient) {
    const sender = new Sender(wsClient);
    let guid = Format.getGUID();
    allUsers[guid] = sender;

    sender.send({ action: 'user-register', guid: guid });

    wsClient.on('close', function () {
        delete allUsers[guid];
    });

    wsClient.on('message', function (message) {
        try {
            const jsonMessage = JSON.parse(message);
            switch (jsonMessage.action) {
                case 'user-connect':
                    Log.trace(`New user register ${guid}!`);
                    break;
                default:
                    Log.trace('Undefined command!');
                    break;
            }
        } catch (error) {
            console.log('Ошибка', error);
        }
    });
}

const sendFile = (filePath, bundleName) => {
    for (let guid in allUsers) {
        allUsers[guid].send({
            action: 'change-bundle',
            bundleName,
            filePath,
            filename: path.basename(filePath),
            bundle: fs.readFileSync(filePath).toString('base64'),
        });
    }
};

// Обход всех папок в конфиге
Object.keys(config.watch).forEach((key) => {
    const folder = config.watch[key];
    chokidar
        .watch(folder, { ignoreInitial: true, persistent: true })
        .on('change', (filePath) => sendFile(filePath.replace(folder, ""), key))
        .on('add', (filePath) => sendFile(filePath.replace(folder, ""), key));
});

Log.trace(`Server start ${config.host}:${config.port}!`);
