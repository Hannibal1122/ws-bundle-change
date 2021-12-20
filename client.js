const WebSocket = require("ws");
const myWs = new WebSocket('ws://localhost:9000');
const Format = require("./core/format").Format;
const Sender = require("./core/info").Sender;

const sender = new Sender(myWs);
let config = JSON.parse(fs.readFileSync("client.config.json", "utf8"));

let guid;
myWs.onopen = function () {
    sender.send({ action: 'user-connect', guid: guid });
};
myWs.onmessage = function (message) {
    try {
        const jsonMessage = JSON.parse(message.data);
        switch (jsonMessage.action) {
            case "user-register":
                guid = jsonMessage.guid;
                break;
            case "change-bundle":
                fs.writeFileSync(config[jsonMessage.bundleName], jsonMessage.bundle); //JSON.stringify(jsonMessage.bundle, null, '\t')
                break;
            default:
                console.log('Неизвестная команда');
                break;
        }
    } catch (error) {
        console.log('Ошибка', error);
    }
};