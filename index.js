/**
 * Created by vd on 20.11.2017.
 */
const config = require('./config'),
    ENV = process.env.NODE_ENV;
const redis = require("redis");
const client = redis.createClient(config.redisPort[ENV]);
const errorHandler = require("./errorHandler");
const generatorMode = require("./generatorMode"),
    CommonClient = require("./commonClient");
const async = require("async");

const myClient = new CommonClient();
const clientNumber = CommonClient.getRandomInt();
// On register new client
// { clientNumber: heartbeat timestamp }

client.on("connect", function () {
});

// Send keepalive messages to know, what client's is online now
setInterval(function () {
    myClient.sendKeepalive();
}, 2000);

client.subscribe(config.channelName[ENV]);

client.on("error", errorHandler);
