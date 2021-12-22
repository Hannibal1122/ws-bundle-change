module.exports.Log = {
    trace(message) {
        console.log(`[WS-Bundle-Change] ${ new Date() }:`, message);
    }
}