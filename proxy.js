const http = require('node:http');
const httpProxy = require('http-proxy');

const {HttpsProxyAgent} = require('https-proxy-agent');

const agent = new HttpsProxyAgent("http://127.0.0.1:8080")

const proxy = httpProxy.createProxyServer({"agent": agent});

http.createServer((req, res) => {
    proxy.web(req, res, {changeOrigin: true,  target: 'http://localhost:3000'});
}).listen(3001);