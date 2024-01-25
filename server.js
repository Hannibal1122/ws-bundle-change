const WebSocket = require('ws');
const fs = require('fs');
const _path = require('path');
const Format = require('./core/format').Format;
const Sender = require('./core/info').Sender;
const Log = require('./core/log').Log;

const chokidar = require('chokidar');

let config = JSON.parse(fs.readFileSync('server.config.json', 'utf8'));
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

for (let key in config.watch) {
    const watchFilePath = config.watch[key];
    fs.watchFile(watchFilePath, (curr, prev) => {
        Log.trace(`${key} file changed!`);
        for (let guid in allUsers) {
            allUsers[guid].send({
                action: 'change-bundle',
                bundleName: key,
                bundle: fs.readFileSync(watchFilePath, 'utf8'),
            });
        }
    });
}

for (let key in config.watchFolder) {
    const watchFolderPath = config.watchFolder[key];
    const watcher = chokidar.watch(watchFolderPath, {
        ignored: /(^|[/\\])\../, // исключает скрытые файлы и папки
        persistent: true,
    });

    watcher
        .on('add', (path) => console.log(`File ${path} has been added.`))
        .on('change', (path) => {
            for (let guid in allUsers) {
                allUsers[guid].send({
                    action: 'change-file',
                    path: _path.relative(watchFolderPath, path),
                    bundle: fs.readFileSync(watchFilePath, 'utf8'),
                });
            }
        })
        .on('unlink', (path) => console.log(`File ${path} has been removed.`))
        .on('addDir', (path) => console.log(`Directory ${path} has been added.`))
        .on('unlinkDir', (path) => console.log(`Directory ${path} has been removed.`))
        .on('error', (error) => console.error(`Watcher error: ${error}`));

    // При необходимости, вы можете добавить обработчик для события `ready`, который будет вызван, когда начнется отслеживание.
    watcher.on('ready', () => console.log('Initial scan complete. Ready for changes.'));
}

Log.trace(`Server start ${config.host}:${config.port}!`);
