const net = require('net');
const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const Log = require('../core/log').Log;

const config = require('./server.config.json');

const sendFile = (filePath, baseDir) => {
    const client = new net.Socket();
    client.connect(config.port, config.host, () => {
        const relativePath = path.relative(baseDir, filePath); // Относительный путь внутри папки
        const content = fs.readFileSync(filePath).toString('base64');

        client.write(JSON.stringify({ folder: baseDir, filename: relativePath, content }));
        console.log(`Файл ${relativePath} из ${baseDir} отправлен`);
        client.end();
    });

    client.on('error', (err) => console.error('Ошибка соединения:', err.message));
};

// Обход всех папок в конфиге
Object.values(config.watch).forEach((folder) => {
    chokidar
        .watch(folder, { ignoreInitial: true, persistent: true })
        .on('change', (filePath) => sendFile(filePath, folder))
        .on('add', (filePath) => sendFile(filePath, folder));
});

Log.trace(`Server start ${config.host}:${config.port}!`);
