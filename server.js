const WebSocket = require('ws');
const fs = require('fs');
const Format = require("./core/format").Format;
const Sender = require("./core/info").Sender;


const wsServer = new WebSocket.Server({ port: 9000 });
wsServer.on('connection', onConnect);

let allUsers = {};

function onConnect(wsClient)
{
    const sender = new Sender(wsClient);
    let guid = Format.getGUID();
    allUsers[guid] = sender;

    sender.send({ action: "user-register", guid: guid });

    wsClient.on('close', function() {
        delete allUsers[guid];
    });

    wsClient.on('message', function(message) {
        try {
            const jsonMessage = JSON.parse(message);
            switch (jsonMessage.action) {
                case "user-connect":
                    console.log("[WS-Bundle-Change]", "Добавлен новый клиент!")
                break;
                default:
                    console.log('Неизвестная команда');
                    break;
            }
        } catch (error) {
            console.log('Ошибка', error);
        }
    });
}


const watchFilePath = '/Users/Mikhail/Projects/pit/vist_pit/static/webpack_pit_dispatcher_v2/config/webpack-stats-dev.json';
console.log(`Watching for file changes on ${ watchFilePath }`);

fs.watchFile(watchFilePath, (curr, prev) => {
    console.log(`${ watchFilePath } file Changed`);
    for(let guid in allUsers) {
        allUsers[guid].send({ action: "change-bundle", bundle: fs.readFileSync(watchFilePath, "utf8") });
    }
});

console.log('Сервер запущен на 9000 порту');