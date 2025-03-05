const net = require('net');
const fs = require('fs');
const path = require('path');

const config = require('./server-config.json');

const server = net.createServer((socket) => {
    console.log('Клиент подключился');

    socket.on('data', (data) => {
        const message = JSON.parse(data.toString());
        const folderPath = config.watch[message.folder];

        if (!folderPath) {
            console.error(`Ошибка: Папка ${message.folder} не найдена в конфиге!`);
            return;
        }

        const filePath = path.join(folderPath, message.filename);
        fs.mkdirSync(path.dirname(filePath), { recursive: true }); // Создаём вложенные папки
        fs.writeFileSync(filePath, Buffer.from(message.content, 'base64'));
        console.log(`Файл ${message.filename} обновлён в ${folderPath}`);
    });

    socket.on('end', () => console.log('Клиент отключился'));
});

server.listen(config.port, config.host, () => {
    console.log(`Сервер слушает ${config.host}:${config.port}`);
});
