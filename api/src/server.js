// Starts the API on port 3000 and serves the React page at http://localhost:3000
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { createApp } = require('./app');

const app = createApp();
const page = path.join(__dirname, '..', '..', 'web', 'index.html');

http
  .createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      return fs.createReadStream(page).pipe(res);
    }
    app(req, res);
  })
  .listen(3000, () => {
    console.log('POSterm running: open http://localhost:3000');
  });
