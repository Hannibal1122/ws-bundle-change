const WebSocket = require('ws');
const fs = require('fs');
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

const sendFile = (filePath, baseDir) => {
    for (let guid in allUsers) {
        allUsers[guid].send({
            action: 'change-bundle',
            bundleName: baseDir,
            filePath,
            bundle: fs.readFileSync(filePath, 'utf8'),
        });
    }
};

// Обход всех папок в конфиге
Object.values(config.watch).forEach((folder) => {
    chokidar
        .watch(folder, { ignoreInitial: true, persistent: true })
        .on('change', (filePath) => sendFile(filePath, folder))
        .on('add', (filePath) => sendFile(filePath, folder));
});

Log.trace(`Server start ${config.host}:${config.port}!`);
