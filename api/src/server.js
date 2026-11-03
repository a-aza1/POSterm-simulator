const http = require('node:http');
const { createApp } = require('./app');

http.createServer(createApp()).listen(3000, () => {
  console.log('POSterm API running on http://localhost:3000');
});
