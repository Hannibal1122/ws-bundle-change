const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const Sender = require('../core/info').Sender;
const Log = require('../core/log').Log;

const config = require('./client.config.json');
const myWs = new WebSocket(`ws://${config.host}:${config.port}`);
const sender = new Sender(myWs);

let guid;
myWs.onopen = function () {
    sender.send({ action: 'user-connect', guid });
};

myWs.onmessage = function (message) {
    try {
        const jsonMessage = JSON.parse(message.data);
        switch (jsonMessage.action) {
            case 'user-register':
                guid = jsonMessage.guid;
                Log.trace(`User register ${guid}!`);
                break;
            case 'change-bundle':
                Log.trace(`${jsonMessage.bundleName} bundle changed!`);
                const folderPath = config.rewrite[jsonMessage.bundleName];
                const filePath = path.join(folderPath, jsonMessage.filePath);
                Log.trace(filePath, jsonMessage);
                fs.writeFileSync(filePath, Buffer.from(jsonMessage.bundle, 'base64'));
                break;
            default:
                Log.trace(`Undefined command!`);
                break;
        }
    } catch (error) {
        Log.trace(error);
    }
};
