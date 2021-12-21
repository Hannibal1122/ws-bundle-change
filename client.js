const WebSocket = require("ws");
const fs = require('fs');
let config = JSON.parse(fs.readFileSync("client.config.json", "utf8"));

const myWs = new WebSocket(`ws://${ config.host }:${ config.port }`);
const Sender = require("./core/info").Sender;
const sender = new Sender(myWs);

let guid;
myWs.onopen = function () {
    sender.send({ action: 'user-connect', guid: guid });
};
myWs.onmessage = function (message) {
    try {
        const jsonMessage = JSON.parse(message.data);
        switch(jsonMessage.action) {
            case "user-register":
                guid = jsonMessage.guid;
                console.log("[WS-Bundle-Change]", `User register ${ guid }!`);
                break;
            case "change-bundle":
                fs.writeFileSync(config.rewrite[jsonMessage.bundleName], jsonMessage.bundle); //JSON.stringify(jsonMessage.bundle, null, '\t')
                break;
            default:
                console.log("[WS-Bundle-Change]", "Undefined command!");
                break;
        }
    } catch(error) {
        console.log('Ошибка', error);
    }
};