module.exports.Log = {
    trace(message) {
        console.log(`[WS-Bundle-Change] ${formatDate(new Date())}:`, message);
    },
};

function formatDate(date) {
    const pad = (num) => num.toString().padStart(2, '0');

    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1); // Месяцы начинаются с 0
    const year = date.getFullYear();

    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
}
