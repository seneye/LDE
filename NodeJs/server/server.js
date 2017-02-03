#!/usr/bin/env node
'use strict';
var http = require("http");
var CryptoJS = require("crypto-js");
var config = require('config');
var ws = require("nodejs-websocket");
var colors = require("colors");
var os = require("os");
var ifaces = os.networkInterfaces();
let Data = Array();
var WSServer = ws.createServer(function (conn) {
    conn.sendText(JSON.stringify(Data));
}).listen(8001);
function AddNewData(data) {
    Data.push(data);
    WSServer.connections.forEach(function (conn) {
        conn.sendText(JSON.stringify(Data));
    });
}
var KnowSources = config.get('KnowSources');
var port = 7878;
http.createServer(function (req, res) {
    if (req.method == 'POST' && req.url == '/localexchange/endpoint' && req.headers["content-type"] == "application/jose") {
        if (!req.headers["x-seneye"]) {
            res.writeHead(400);
            res.end();
            return;
        }
        let currSource = KnowSources.find(o => o.source == req.headers["x-seneye"]);
        if (!currSource) {
            res.writeHead(404);
            res.end();
            return;
        }
        req.setEncoding('utf8');
        var body;
        body = new Array();
        req.on('data', function (chunk) {
            body.push(chunk);
        }).on('end', function () {
            var r;
            var isValid = false;
            r = (body.join()).split(".");
            if (r.length == 3) {
                if (r[0] == "eyJhbGciOiJIUzI1NiJ9") {
                    var sign = CryptoJS.HmacSHA256(r[0] + "." + r[1], currSource.secret);
                    var psign = CryptoJS.enc.Base64.parse(r[2]);
                    if (sign.toString() == psign.toString()) {
                        isValid = true;
                        var buf = Buffer.from(r[1], 'base64');
                        var d = JSON.parse(buf.toString());
                        AddNewData(d.SUD);
                    }
                }
            }
            if (isValid) {
                res.writeHead(200);
            }
            else {
                res.writeHead(400);
            }
            res.end();
        });
    }
    else {
        res.writeHead(404);
        res.end();
    }
})
    .listen(port, '0.0.0.0', function () {
    var canonicalHost = '127.0.0.1', protocol = 'http://';
    console.info('Starting up Local API Server, serving :\r\n'.red);
    Object.keys(ifaces).forEach(function (dev) {
        ifaces[dev].forEach(function (details) {
            if (details.family === 'IPv4') {
                console.info(('->> ' + protocol + details.address + ':' + port.toString() + "/localexchange/endpoint").green);
            }
        });
    });
});
if (process.platform === 'win32') {
    require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    }).on('SIGINT', function () {
        process.emit('SIGINT');
    });
}
process.on('SIGINT', function () {
    console.info('Local API Server stopped.'.red);
    process.exit();
});
process.on('SIGTERM', function () {
    console.info('Local API Server stopped.'.red);
    process.exit();
});

//# sourceMappingURL=server.js.map
