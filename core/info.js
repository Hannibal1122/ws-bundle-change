module.exports.ClientMessage = {
    "user-connect": "user-connect"
}
module.exports.ServerMessage = {
    
}
module.exports.Sender = class Sender {
    constructor(ws)
    {
        this.ws = ws;
    }
    send(data)
    {
        this.ws.send(JSON.stringify(data));
    }
}